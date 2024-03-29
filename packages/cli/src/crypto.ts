/**
 * Copyright 2020 Opstrace, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import crypto from "crypto";
import fs from "fs";

import jwt from "jsonwebtoken";

import { log, keyIDfromPEM, die } from "@opstrace/utils";

export interface RSAKeypair {
  privkeyObj: crypto.KeyObject;
  pubkeyPem: string;
}

// Declare global: expose RSA keypair as singleton object:
//
// - The private key as `crypto.KeyObject` object (not supposed to leave this
//   context in a serialized fashion, supposed to be used for signing one or
//   many JSON Web Token(s)).
//
// - The public key serialized as text (PEM OpenSSL format) -- not meant to be
//   used by business logic in this CLI session, but actually supposed to be
//   handed over to the Opstrace cluster as non-sensitive configuration
//   parameter.
let keypairForSession: RSAKeypair;

function initialize() {
  keypairForSession = generateRSAkeypair();
}

export function generateJWTforTenantAPI(
  tenantName: string,
  opstraceClusterName: string
): string {
  if (keypairForSession === undefined) {
    initialize();
  }

  return generateJWTforTenantAPIfromKeyPair(
    tenantName,
    opstraceClusterName,
    keypairForSession
  );
}

export function generateJWTforTenantAPIfromKeyPair(
  tenantName: string,
  opstraceClusterName: string,
  keypair: RSAKeypair
): string {
  // auth0/node-jsonwebtoken does not seem to support the native nodejs
  // private key object (crypto.KeyObject) for signing, also see
  // https://github.com/auth0/node-jsonwebtoken/issues/750
  const privkeyPem = keypair.privkeyObj.export({
    type: "pkcs1",
    format: "pem"
  }) as string;

  const pubkeyId = keyIDfromPEM(keypair.pubkeyPem);

  // Opstrace-specific spec:
  //  audience: required, special string
  //  subject: special format, `tenant-` prefix to tenant name
  //  keyid: required, refers to public key correspondig to priv key used
  //         for signing
  const options: jwt.SignOptions = {
    audience: `opstrace-cluster-${opstraceClusterName}`,
    algorithm: "RS256" as const,
    expiresIn: "10y",
    issuer: "opstrace-cli",
    subject: `tenant-${tenantName}`,
    keyid: pubkeyId // added in 2nd gen tokens March 03
  };

  const token: string = jwt.sign({}, privkeyPem, options);
  log.info(
    "generated tenant API authentication token for cluster `%s` for tenant `%s`, to be verified with key %s",
    opstraceClusterName,
    tenantName,
    pubkeyId
  );

  return token;
}

/**
 * Generate RSA key pair.
 *
 * Serialize the public key into the "OpenSSL PEM public key format", which
 * more precisely can be referred to as PEM-encoded X.509 SubjectPublicKeyInfo
 * (neither pkcs1, nor pkcs8).. Also see
 * https://stackoverflow.com/a/29707204/145400. Needed a little trial and error
 * to find that `spki` (see code below) refers to that very format in the
 * NodeJS crypto module.
 *
 * Confirmation that the public key is serialized into this format can be
 * achieved in the following way, with the help of the `openssl` command:

   ```
      $ openssl rsa -pubin -in rsa_pubkey.pem -text -noout
      RSA Public-Key: (2048 bit)
      Modulus:
          00:bf:e0:2c:e7:ae:8b:75:32:18:2d:71:0f:d3:86:
          44:ea:e3:ab:d4:cb:75:25:4a:0b:a9:ad:c9:ce:38:
          <snip>
          44:32:4f:54:d4:14:75:ed:46:90:fa:01:39:c1:41:
          99:8d
      Exponent: 65537 (0x10001)
   ```
 *
 * Future consideration: use ECDSA keypair (shorter auth tokens).
 **/
function generateRSAkeypair(): RSAKeypair {
  if (keypairForSession !== undefined) {
    throw Error("already set");
  }

  const modulusLengthBits = 2048;

  log.info(
    "generate new RSA keypair. Modulus length (bits): %s",
    modulusLengthBits
  );

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: modulusLengthBits
  });

  const pubkeyPem = publicKey.export({
    type: "spki",
    format: "pem"
  }) as string;

  return {
    privkeyObj: privateKey,
    pubkeyPem: pubkeyPem
  };
}

export function getPubkeyAsPem(): string {
  if (keypairForSession === undefined) {
    initialize();
  }

  return keypairForSession.pubkeyPem;
}

export function readRSAKeyPairfromPEMfile(fpath: string): RSAKeypair {
  let pemstring: string;

  try {
    pemstring = fs.readFileSync(fpath, "utf8");
  } catch (err: any) {
    // This is an over-generalized error handler. Would have loved to
    // handle only SystemError (around file interaction) and decoding
    // errors, and re-raise every other error. How to do that cleanly?
    // Also see https://github.com/nodejs/node/issues/8342.
    // expected errors: ENOENT, EACCES, and related, also decoding errors.
    return die(`could not read file '${fpath}': ${err.message}`);
  }

  // Expect PEM file structure to be of kind PKCS1:
  //
  // -----BEGIN RSA PRIVATE KEY-----
  // MIIEpAIBAAKCAQEAwHtWIYduVZI2JK2wmDCisgSCIwAWCor1WZx/U3iXWwI9HaoG
  // ...
  // r7FksGLN0LhHuKM1EC4oSZGSBjIdm6GJ0oGNglprgZ/rY7VTcNU3HicMXTUuNaIu
  // 9f1rA3YxtkddPgZVebl/AFMnV5RK+1Yujy2VKlOPd2bcBtOFg4i8ww==
  // -----END RSA PRIVATE KEY-----
  //
  // ... or of type PKCS8:
  // -----BEGIN PRIVATE KEY-----
  // ...
  // -----END PRIVATE KEY-----

  let privkey: crypto.KeyObject;
  let pubkey: crypto.KeyObject;

  try {
    privkey = crypto.createPrivateKey({ key: pemstring, format: "pem" });
  } catch (err: any) {
    return die(`could not deserialize RSA private key: ${err.message}`);
  }

  try {
    pubkey = crypto.createPublicKey({ key: pemstring, format: "pem" });
  } catch (err: any) {
    return die(`could not deserialize RSA public key: ${err.message}`);
  }

  log.info("deserialized private key of type: %s", privkey.asymmetricKeyType);

  if (pubkey.asymmetricKeyType !== "rsa") {
    die("unexpected key type");
  }

  const pubkeyPem = pubkey.export({
    type: "spki",
    format: "pem"
  }) as string;

  return {
    privkeyObj: privkey,
    pubkeyPem: pubkeyPem
  };
}

export function readRSAPubKeyfromPEMfileAsPEMstring(fpath: string): string {
  // Expect a PEM file encoding just the public key, or a key pair file which
  // at the surface seems to encode only the private key, but the public key
  // can always be derived from that, which is what the code
  // `createPublicKey()` below does.
  let pemstring: string;

  try {
    pemstring = fs.readFileSync(fpath, "utf8");
  } catch (err: any) {
    // This is an over-generalized error handler. Would have loved to
    // handle only SystemError (around file interaction) and decoding
    // errors, and re-raise every other error. How to do that cleanly?
    // Also see https://github.com/nodejs/node/issues/8342.
    // expected errors: ENOENT, EACCES, and related, also decoding errors.
    return die(`could not read file '${fpath}': ${err.message}`);
  }

  let pubkey: crypto.KeyObject;

  try {
    pubkey = crypto.createPublicKey({ key: pemstring, format: "pem" });
  } catch (err: any) {
    return die(`could not deserialize RSA public key: ${err.message}`);
  }

  log.info("deserialized public key of type: %s", pubkey.asymmetricKeyType);

  if (pubkey.asymmetricKeyType !== "rsa") {
    die("unexpected key type");
  }

  const pubkeyPem = pubkey.export({
    type: "spki",
    format: "pem"
  }) as string;

  return pubkeyPem;
}
