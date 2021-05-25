set -e

logTest () {
  echo "======================================"
  echo "Running tests for $1"
  echo "======================================"
}

run_repo_tests () {
  local REPOS_DIR="$(pwd)/repos"
  local REPOS=$(ls "$REPOS_DIR")

  for REPO in $REPOS; do
    echo "$REPO"
    local REPO_PATH="$REPOS_DIR/$REPO"

    # only run a test if the repo is a package
    if [[ ! -f "$REPO_PATH/package.json" ]]; then
      continue
    fi
    cd "$REPO_PATH"
    logTest $REPO
    yarn test
  done

}

# run the root cli tests
logTest "keg-cli"
yarn test:jest

# run each repo test
run_repo_tests
