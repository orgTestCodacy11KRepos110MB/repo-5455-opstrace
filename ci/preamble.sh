#!/usr/bin/env bash
set -o errexit
set -o errtrace
set -o nounset
set -o pipefail

# Context: this is running in the container started from the image defined via
# opstrace-ci.Dockerfile. The build directory (within TMPDIR on host) is
# mounted at /build.

echo "running $(basename $0)"


set -o xtrace

# For debugging potential issues. `gcloud` is a moving target in our CI and
# if something fails around the gcloud CLI it's good to know exactly which
# version we ran.
gcloud --version

# Same story for the AWS CLI
aws --version

make fetch-secrets
make set-dockerhub-credentials

echo "--- lint docs: quick feedback"
make lint-docs

# If this is a docs-only change: skip the rest of the preamble, move on to the
# next build step in the BK pipeline which allows for a
# docs-only-change-fastpath-pipeline-exit.
echo "check if this is a docs-only change, exit preamble early if so"
bash ci/check-if-docs-pr.sh && exit 0


# Note(JP): this command is expected to take a minute or so (e.g., 70.35 s).
# Start this now in the background, redirect output to file. Wait for and
# handle error later, below.
echo "--- start yarn background process"
# The "UI APP" dependencies are not needed anywhere but in the container image
# build for it. Deactivate this package here for a moment during running yarn.
# This is expected to cut 1.5 minutes from the preamble which is more than 20 %
# of the preamble runtime when nothing in packages/app changed (i.e. when the
# container image is not rebuilt).
mv packages/app/package.json packages/app/package.json.deactivated
yarn --frozen-lockfile --ignore-optional \
    2> preamble_yarn_install.outerr < /dev/null &
YARN_PID="$!"
sleep 1 # so that the xtrace output is in this build log section

echo "--- prettier --check on typescript files"
# Enforce consistent code formatting, based on .prettierrc and .prettierignore
prettier --check 'lib/**/*.ts'
prettier --check 'packages/**/*.ts'
prettier --check 'test/**/*.ts'

echo "--- detect missing license headers"
make check-license-headers

echo "--- wait for yarn background process"
# What follows requires the `yarn` dep installation above to have completed.
set +e
wait $YARN_PID
YARN_EXIT_CODE="$?"
echo "yarn process terminated with code $ YARN_EXIT_CODE. stdout/err:"
cat preamble_yarn_install.outerr
if [[ $YARN_EXIT_CODE != "0" ]]; then
    echo "yarn failed, exit 1"
    exit 1
fi
set -x

echo "--- lint codebase: quick feedback"
make lint-codebase

# This is needed also by the app Docker image build
echo "--- make set-build-info-constants"
make set-build-info-constants

# If there are any changes to go directory then build and publish the images to
# docker hub. Update packages/controller-config/docker-images.json to use the
# newly built image tags in this test run.
# This step will check various packages and determine if docker images should be
# rebuilt and pushed.
# - cortex-proxy-api
# - loki-proxy-api
# - app
# - graphql
echo "--- Update docker-images.json"
# Reactivate the NPM package at packages/app (see above).
mv packages/app/package.json.deactivated packages/app/package.json
set +x
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
${DIR}/build-docker-images-update-controller-config.sh
set -x

echo "--- build looker image"
# looker: does image build? push it, too!
# run `make image` in subshell so that cwd stays as-is
# `make image` is supposed to inherit the env variable CHECKOUT_VERSION_STRING
( cd test/test-remote/looker ; make image ; make publish )

echo "--- build looker in non-isolated environment (for local dev)"
# Note(JP): the looker build via Dockerfile is special. During local looker
# dev, I am used to using a different build method. Which might break when it's
# not covered by CI.
( cd test/test-remote/looker; yarn ; yarn run tsc --project tsconfig.json)

# Do this early when the checkout is fresh (no non-repo files within /packages
# or /lib as of previous tsc invocations -- these could erroenously invalidate
# the controller image cache layers).
echo "--- make build-and-push-controller-image"
make build-and-push-controller-image

echo "--- Compile Typescript code base, trigger pkg single-binary builds"

# First, set yarn cache to be shared across all CI runs.
# See opstrace-prelaunch/issues/1695
# and https://github.com/yarnpkg/yarn/issues/2181#issuecomment-559871605
# edit: deactivated again, see
# opstrace-prelaunch/issues/1757
# mkdir -p /tmp/yarn-cache-opstrace && yarn config set cache-folder /tmp/yarn-cache-opstrace

# tsc-build the Opstrace cluster management CLI (depends on installer and
# uninstaller) and then also pkg-build it (for linux).
echo "--- make cli-tsc"
make cli-tsc

echo "--- make cli-pkg (for linux and mac)"
echo "warning: interleaved output of two commands"
# note(JP) start in background , then also start the macos build. Each takes
# about one minute, i.e. we want to save about one minute here (these are
# executed on a beefy machine)
make cli-pkg &
sleep 5 && echo -e "\n\n" # so that the output is not worst-case interleaved
make cli-pkg-macos &
# wait for background processes to exit.
wait

echo "--- CLI single-binary sanity check"
# Quick sanity-check: confirm that CHECKOUT_VERSION_STRING is in stdout
./build/bin/opstrace --version
./build/bin/opstrace --version | grep "${CHECKOUT_VERSION_STRING}"

echo "--- make rebuild-testrunner-container-images"
make rebuild-testrunner-container-images

echo "--- build looker image"
# looker: does image build? push it, too!
# run `make image` in subshell so that cwd stays as-is
# `make image` is supposed to inherit the env variable CHECKOUT_VERSION_STRING
( cd test/test-remote/looker ; make image ; make publish )

echo "--- build looker in non-isolated environment (for local dev)"
# Note(JP): the looker build via Dockerfile is special. During local looker
# dev, I am used to using a different build method. Which might break when it's
( cd test/test-remote/looker; yarn run tsc --project tsconfig.json)

# subsequent build steps are supposed to depend on actual build artifacts like
# the pkg-based single binary CLI or Docker images. The node_modules dir
# (expected to be more than 1 GB in size) is not needed anymore. Remove it.
# Note(JP): as of today (March 2021) we seem to install node_modules again
# right thereafter, for the unit tests... That should probably be consolidated
# :).
rm -rf node_modules

echo "--- the largest files and dirs in this prebuild dir:"
pwd
du -ha . | sort -r -h | head -n 100 || true
