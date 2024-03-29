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

import { strict as assert } from "assert";
import crypto from "crypto";

import got from "got";
import { ZonedDateTime, LocalDateTime, ZoneOffset } from "@js-joda/core";

import { log } from "../log";
import {
  mtimeDiffSeconds,
  mtimeDeadlineInSeconds,
  mtime,
  sleep
} from "../mtime";

import {
  timestampToRFC3339Nano,
  rndstringFast,
  rndstringFastBoringFill,
  httpTimeoutSettings,
  logHTTPResponse
} from "../util";

import {
  LogSample,
  LogSampleTimestamp,
  LogSeriesFragment,
  LogSeriesFragmentStats,
  logqlLabelString
} from "./index";

import { TimeseriesBase, LabelSet, WalltimeCouplingOptions } from "../series";

// Note: maybe expose raw labels later on again.
export interface LogSeriesOpts {
  // think: n log entries per stream/series fragment
  n_samples_per_series_fragment: number;
  n_chars_per_msg: number;
  starttime: ZonedDateTime;
  // The time difference between adjacent log samples in a series fragment, in
  // nanoseconds. Expected to be an integer. Defined via the substraction of
  // timestamps: T_(i+1) - T_i
  sample_time_increment_ns: number;
  includeTimeInMsg: boolean;
  uniqueName: string;
  labelset: LabelSet | undefined;
  compressability: string;

  // if undefined: do not couple to wall time
  wtopts?: WalltimeCouplingOptions;

  // Supposed to contain a prometheus counter object, providing an inc() method.
  counterForwardLeap?: any;
}

type TypeHttpHeaderDict = Record<string, string>;
type TypeQueryParamDict = Record<string, string>;

type CustomQueryFuncSigType = (
  arg0: string,
  arg1: TypeHttpHeaderDict,
  arg2: TypeQueryParamDict,
  arg3: number,
  arg4: number,
  arg5: LogSeries
) => Promise<LokiQueryResult>;

export interface LogSeriesFetchAndValidateOpts {
  querierBaseUrl: string;
  additionalHeaders: Record<string, string>;
  //inspectEveryNthEntry?: number | undefined;
  customLokiQueryFunc?: CustomQueryFuncSigType;
}

//export class LogSeries extends TimeseriesBase {
export class LogSeries extends TimeseriesBase<LogSeriesFragment> {
  private currentSeconds: number;
  private currentNanos: number;
  private includeTimeInMsg: boolean;
  private firstEntryGenerated: boolean;
  private genChars: (n: number) => string;

  n_chars_per_msg: number;

  nFragmentsSuccessfullySentSinceLastValidate: number;

  constructor(opts: LogSeriesOpts) {
    super(opts);

    this.currentSeconds = opts.starttime.toEpochSecond();
    this.currentNanos = opts.starttime.nano();
    this.firstEntryGenerated = false;

    this.n_chars_per_msg = opts.n_chars_per_msg;
    this.nFragmentsConsumed = 0;
    this.includeTimeInMsg = opts.includeTimeInMsg;

    // when using the dummystream to generate data and actually POST it
    // to an API use this counter to keep track of the number of fragments
    // successfully sent. This is public because of external push func.
    this.nFragmentsSuccessfullySentSinceLastValidate = 0;

    if (this.sample_time_increment_ns > 999999999)
      throw Error("sample_time_increment_ns must be smaller than 1 s");

    if (this.includeTimeInMsg && this.n_chars_per_msg < 19) {
      throw Error("timestamp consumes 18+1 characters");
    }

    switch (opts.compressability) {
      case "min":
        this.genChars = rndstringFast;
        break;
      case "max":
        this.genChars = (n: number) => {
          return "a".repeat(n);
        };
        break;
      case "medium":
        this.genChars = (n: number) => {
          // "half random", "half always-the-same"
          // fast floored integer division:
          // (11/2>>0) -> 5
          // remainder: 11 % 2 -> 1
          // example for n=10:
          //  rndstringFastBoringFill(5, 5)
          // example for n=11:
          //  rndstringFastBoringFill(5, 6)
          // Note(JP): this could be further optimized by making n not be
          // dynamic (because considering `includeTimeInMsg` and the rest of
          // the static dummystream config this is predictable, n does not need
          // to be dynamically evaluated upon _each_ function call here).
          return rndstringFastBoringFill(
            (n / 2) >> 0,
            ((n / 2) >> 0) + (n % 2)
          );
        };
        break;
      default:
        throw new Error(`bad compressability value: ${opts.compressability}`);
    }
  }

  // public addToNFragmentsTotal(n: number) {
  //   this.opts.n_fragments_total += n;
  //   this.n_fragments_total += n;
  // }

  protected buildLabelSetFromOpts(opts: LogSeriesOpts): LabelSet {
    let ls: LabelSet;
    if (opts.labelset !== undefined) {
      ls = opts.labelset;
      ls.looker_uniquename = opts.uniqueName;
    } else {
      ls = { looker_uniquename: opts.uniqueName };
    }
    return ls;
  }

  public promQueryString(): string {
    return `{looker_uniquename="${this.uniqueName}"}`;
  }

  private buildMsgText(): string {
    let text: string;
    if (!this.includeTimeInMsg) text = this.genChars(this.n_chars_per_msg);
    else {
      // build integer string, indicating the number of nanoseconds passed
      // since epoch, as is common in the Loki ecosystem.
      const timestring = `${this.currentSeconds}${this.currentNanos
        .toString()
        .padStart(9, "0")}`;
      // Note(JP): timestring is known to be 19 chars long. Also note that in
      // this case the "compressability" aspect changes, depending on the ratio
      // between the desired message length and the length of this timestring.
      // From a message length of 100 onwards I believer it is fair to say
      // that "max" compressability is still a very high compressability even
      // when the message is prefixed with this timestring.
      text = `${timestring}:${this.genChars(this.n_chars_per_msg - 19)}`;
    }
    return text;
  }

  // Note(JP): this is OK to lose precision compared to the internal two
  // var-based representation (though I don't understand enough of JavaScripts
  // number type to know if this actually may lose precision.
  protected lastSampleSecondsSinceEpoch(): number {
    return this.currentSeconds + this.currentNanos / 10 ** 9;
  }

  protected nextSample(): LogSample {
    // don't bump time before first entry was generated.
    if (this.firstEntryGenerated) {
      this.currentNanos += this.sample_time_increment_ns;
      if (this.currentNanos > 999999999) {
        this.currentNanos = this.currentNanos - 10 ** 9;
        this.currentSeconds += 1;
      }
    }

    const ts: LogSampleTimestamp = {
      seconds: this.currentSeconds,
      nanos: this.currentNanos
    };

    // of course this only needs to be run once, and I hope that the compiler
    // optimizes this away.
    this.firstEntryGenerated = true;
    return new LogSample(this.buildMsgText(), ts);
  }

  // no stop criterion
  protected generateNextFragment(): LogSeriesFragment {
    const f = new LogSeriesFragment(
      this.labels,
      this.nFragmentsConsumed + 1,
      this
    );
    for (let i = 0; i < this.n_samples_per_series_fragment; i++) {
      f.addSample(this.nextSample());
    }

    this.nFragmentsConsumed += 1;
    return f;
  }

  /**
   * Unbuffered POST to Loki (generate/post/generate/post sequentially in that
   * order, and do not retry upon POST errors, except for 429 responses.
   *
   * @param lokiBaseUrl
   */
  public async postFragmentsToLoki(
    nFragments: number,
    lokiBaseUrl: string,
    additionalHeaders?: Record<string, string>
  ) {
    // For now: one HTTP request per fragment
    for (let i = 1; i <= nFragments; i++) {
      let fragment: LogSeriesFragment;
      while (true) {
        const [shiftIntoPastSeconds, f] = this.generateNextFragmentOrSkip();
        if (f !== undefined) {
          fragment = f;
          break;
        }

        log.debug(
          `${this}: current lag compared to wall time ` +
            `(${shiftIntoPastSeconds.toFixed(1)} s)` +
            "is too small. Delay fragment generation."
        );
        await sleep(5);
      }

      const t0 = mtime();
      const pushrequest = fragment.serialize();
      const genduration = mtimeDiffSeconds(t0);
      // Control log verbosity
      if (fragment.index < 5 || fragment.index % 10 === 0) {
        log.info(
          "Generated PR for stream %s in %s s, push %s MiB (%s entries)",
          this.uniqueName,
          genduration.toFixed(2),
          pushrequest.dataLengthMiB.toFixed(4),
          // for now: assume that there is _one_ fragment here
          pushrequest.fragments[0].sampleCount()
        );
      }
      await pushrequest.postWithRetryOrError(lokiBaseUrl, 3, additionalHeaders);

      if (this.shouldBeValidated()) {
        assert(this.postedFragmentsSinceLastValidate);
        this.postedFragmentsSinceLastValidate.push(fragment);
      }
    }
  }

  protected leapForward(n: bigint): void {
    // invariant: this must not be called when `this.walltimeCouplingOptions`
    // is undefined.
    assert(this.walltimeCouplingOptions);
    // `currentSeconds` is of type `number` but must always hold an integer
    // value. To make this explicit and to get some compiler support, require
    // `n` to be passed as type `bigint`.
    this.currentSeconds += Number(n);
  }

  public currentTime(): ZonedDateTime {
    // Return the time corresponding to the last generated entry.

    // First, construct datetime object with 1 s resoltution.
    const tsSecondResolution = LocalDateTime.ofEpochSecond(
      this.currentSeconds,
      ZoneOffset.UTC
    );

    // Now construct datetime object with ns resolution using the previous
    // object.
    const tsNanoSecondResolution = LocalDateTime.of(
      tsSecondResolution.year(),
      tsSecondResolution.month(),
      tsSecondResolution.dayOfMonth(),
      tsSecondResolution.hour(),
      tsSecondResolution.minute(),
      tsSecondResolution.second(),
      this.currentNanos
    );

    return tsNanoSecondResolution.atZone(ZoneOffset.UTC);
  }

  public currentTimeRFC3339Nano(): string {
    return timestampToRFC3339Nano(this.currentTime());
  }

  private queryParamsForFragment(fragment: LogSeriesFragment) {
    // Confirm that fragment is 'closed' (serialized, has stats), and override
    // type from `LogStreamFragmentStats | MetricSeriesFragmentStats` to just
    // `MetricSeriesFragmentStats`.
    assert(fragment.stats);
    const stats = fragment.stats as LogSeriesFragmentStats;

    if (stats.sampleCount > 60000) {
      throw new Error(
        "too many samples to fetch in one go -- needs feature: N queries per fragment"
      );
    }

    const qparams: TypeQueryParamDict = {
      query: logqlLabelString(this.labels),
      direction: "FORWARD",
      limit: stats.sampleCount.toString(),
      start: stats.timeOfFirstEntry.toString(),
      // end is not inclusive, i.e. if we set `end` to e.g. 1582211051130000099
      // then the last entry returned would be from 1582211051130000098 even if
      // there is one at 1582211051130000099. So, bump this by one nanosecond
      // to get N entries returned in the happy case.
      end: (stats.timeOfLastEntry + BigInt(1)).toString()
    };

    log.debug("query params: %s", qparams);
    return qparams;
  }

  protected async fetchAndValidateFragment(
    fragment: LogSeriesFragment,
    opts: LogSeriesFetchAndValidateOpts
  ): Promise<number> {
    assert(fragment.stats);
    const stats = fragment.stats as LogSeriesFragmentStats;

    const qparams = this.queryParamsForFragment(fragment);

    let result: LokiQueryResult;
    if (opts.customLokiQueryFunc !== undefined) {
      result = await opts.customLokiQueryFunc(
        opts.querierBaseUrl,
        opts.additionalHeaders,
        qparams,
        Number(stats.sampleCount),
        fragment.index,
        this // pass dummystream object to func for better error reporting
      );
    } else {
      // used by e.g. test-remote project (can change)
      result = await waitForLokiQueryResult(
        opts.querierBaseUrl,
        opts.additionalHeaders,
        qparams,
        Number(stats.sampleCount),
        false,
        1,
        false // disable building hash over payload
      );
    }

    // TODO: compare stats derived from the query result with the .stats
    // propery on the fragment.
    const logTextHash = crypto.createHash("md5");
    for (const e of result.entries) {
      // Update log text hash with the UTF-8-encoded version of the text. From
      // docs: "If encoding is not provided, and the data is a string, an
      // encoding of 'utf8' is enforced"
      logTextHash.update(e[1]);
    }
    const textmd5fromq = logTextHash.digest("hex");

    if (stats.textmd5 !== textmd5fromq) {
      throw new Error(
        "log time series fragment text checksum mismatch: " +
          `series: ${fragment.parent!.promQueryString} ` +
          `fragment: ${fragment.index} + \n fragment stats: ` +
          JSON.stringify(stats, null, 2) +
          `\nchecksum from query result: ${textmd5fromq}`
      );
    }

    return result.entries.length;
  }
}

export interface LokiQueryResult {
  entries: Array<[string, string]>;
  labels: LabelSet;
  textmd5: string;
}

/**
 * Expected to throw got.RequestError, handle in caller if desired.
 */
async function queryLoki(
  baseUrl: string,
  queryParams: URLSearchParams,
  additionalHeaders: TypeHttpHeaderDict
) {
  /* Notes, in no particular order:

  - Note that Loki seems to set `'Content-Type': 'text/plain; charset=utf-8'`
    even when it sends a JSON document in the response body. Submit a bug
    report, and at some point test that this is not the case anymore here.
  */
  const url = `${baseUrl}/loki/api/v1/query_range`;

  const options = {
    throwHttpErrors: false,
    searchParams: queryParams,
    timeout: httpTimeoutSettings,
    headers: additionalHeaders,
    https: { rejectUnauthorized: false } // insecure TLS for now
  };

  // Note: this may throw got.RequestError for request timeout errors.
  const response = await got(url, options);
  if (response.statusCode !== 200) logHTTPResponse(response);
  return JSON.parse(response.body);
}

async function waitForLokiQueryResult(
  lokiQuerierBaseUrl: string,
  additionalHeaders: TypeHttpHeaderDict,
  queryParams: TypeQueryParamDict,
  expectedSampleCount: number | undefined,
  logDetails = true,
  expectedStreamCount = 1,
  buildhash = true,
  maxWaitSeconds = 30
): Promise<LokiQueryResult> {
  const deadline = mtimeDeadlineInSeconds(maxWaitSeconds);
  if (logDetails) {
    log.info(
      `Enter Loki query loop, wait for expected result, deadline ${maxWaitSeconds} s.
Query parameters: ${JSON.stringify(
        queryParams,
        Object.keys(queryParams).sort(),
        2
      )}`
    );
  }

  const qparms = new URLSearchParams(queryParams);
  let queryCount = 0;
  const t0 = mtime();

  // `break`ing out the loop enters the error path, returning indicates
  // success.
  while (true) {
    if (mtime() > deadline) {
      log.error("query deadline hit");
      break;
    }

    queryCount += 1;

    let result: any;
    try {
      result = await queryLoki(lokiQuerierBaseUrl, qparms, additionalHeaders);
    } catch (e: any) {
      // handle any error that happened during http request processing
      if (e instanceof got.RequestError) {
        log.info(
          `waitForLokiQueryResult() loop: http request failed: ${e.message} -- ignore, proceed with next iteration`
        );
        continue;
      } else if (e instanceof SyntaxError) {
        // JSON.parse() failed on loki response (e.g. 500 error)
        log.warning(
          `waitForLokiQueryResult() loop: http parse response failed: ${e.message} -- ignore, proceed with next iteration`
        );
        continue;
      } else {
        // Throw any other error, mainly programming error.
        throw e;
      }
    }

    if (result.status === undefined) {
      log.warning(
        "no `status` property in response doc: %s",
        JSON.stringify(result)
      );
      await sleep(1);
      continue;
    }

    if (result.status !== "success") {
      log.warning(
        "status property is not `success`: %s",
        JSON.stringify(result.status)
      );
      await sleep(1);
      continue;
    }

    // Plan for the following structure.
    // {
    //   "status": "success",
    //   "data": {
    //     "resultType": "streams",
    //     "result": [
    //       {
    //         "stream": {
    //           "filename": "/var/log/myproject.log",
    //           "job": "varlogs",
    //           "level": "info"
    //         },
    //         "values": [
    //           [
    //             "1569266497240578000",
    //             "foo"
    //           ],
    //           [
    //             "1569266492548155000",
    //             "bar"
    //           ]
    //         ]
    //       }
    //     ],
    //     "stats": {
    //       ...
    //     }
    //   }
    // }

    const streams = result.data.result;

    if (streams.length === 0) {
      if (queryCount % 10 === 0) {
        log.info("queried %s times, no log entries seen yet", queryCount);
      }
      await sleep(0.5);
      continue;
    }

    if (logDetails)
      log.info(
        "query %s response data:\n%s",
        queryCount,
        JSON.stringify(result, null, 2)
      );

    // Note: 0 is a special case for "don't check the count!"
    // Conditionally check for number of expected label sets / "streams".
    if (expectedStreamCount !== 0) {
      assert.equal(streams.length, expectedStreamCount);
    }

    // Even if we got multiple streams here go with just one of them.
    assert("values" in streams[0]);

    const sampleCount = streams[0]["values"].length;
    log.info(
      "expected nbr of query results: %s, got %s",
      expectedSampleCount,
      sampleCount
    );

    // Expect N log entries in the stream.
    if (
      expectedSampleCount === undefined ||
      sampleCount === expectedSampleCount
    ) {
      log.info(
        "got expected result in query %s after %s s",
        queryCount,
        mtimeDiffSeconds(t0).toFixed(2)
      );
      const labels: LabelSet = streams[0].stream; //logqlKvPairTextToObj(data["streams"][0]["labels"]);
      //log.info("labels on returned log record:\n%s", labels);

      // Build a hash over all log message contents in this stream, in the
      // the order as returned by Loki. Can be used to verify that the same
      // payload data came out of the system as was put into it. Note: text
      // is encoded as utf-8 implicitly before hashing.
      let textmd5 = "disabled";
      if (buildhash) {
        const logTextHash = crypto.createHash("md5");
        for (const entry of streams[0]["values"]) {
          // entry[0] is the timestamp (ns precision integer as string)
          // entry[1] is the log line
          logTextHash.update(entry[1]);
        }
        textmd5 = logTextHash.digest("hex");
      }

      const result: LokiQueryResult = {
        entries: streams[0]["values"],
        labels: labels,
        textmd5: textmd5
      };
      return result;
    }

    if (sampleCount < expectedSampleCount) {
      log.info("not enough entries returned yet, waiting");
      await sleep(1);
      continue;
    } else throw new Error("too many entries returned in query result");
  }
  throw new Error(`Expectation not fulfilled within ${maxWaitSeconds} s`);
}
