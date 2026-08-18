#!/usr/bin/env node

import { readFileSync } from "node:fs";

const orderedStates = [
  "DISCOVERED",
  "SELECTED",
  "REPRODUCED",
  "FIXED_LOCAL",
  "VERIFIED",
  "COMMITTED",
  "PUSHED",
  "DEPLOYED",
  "MEEGLE_UPDATED",
  "CLOSED_VERIFIED",
];
const validStates = new Set([...orderedStates, "NEEDS_DETAIL", "BLOCKED"]);

function requireValue(errors, condition, message) {
  if (!condition) errors.push(message);
}

function validateBug(bug, index) {
  const errors = [];
  const prefix = `bugs[${index}]`;
  const atLeast = (state) => orderedStates.indexOf(bug?.state) >= orderedStates.indexOf(state);

  requireValue(errors, typeof bug?.id === "string" && bug.id.length > 0, `${prefix}.id is required`);
  requireValue(errors, validStates.has(bug?.state), `${prefix}.state is invalid`);

  if (atLeast("REPRODUCED")) {
    requireValue(errors, bug.reproduction?.confirmed === true, `${prefix}.reproduction.confirmed must be true`);
  }
  if (atLeast("VERIFIED")) {
    requireValue(errors, bug.verification?.focused_tests === "passed", `${prefix}.verification.focused_tests must be passed`);
    requireValue(errors, bug.verification?.full_tests === "passed", `${prefix}.verification.full_tests must be passed`);
    requireValue(errors, bug.verification?.build === "passed", `${prefix}.verification.build must be passed`);
  }
  if (atLeast("COMMITTED")) {
    requireValue(errors, typeof bug.commit?.sha === "string" && bug.commit.sha.length >= 7, `${prefix}.commit.sha is required`);
    requireValue(errors, bug.commit?.scope_verified === true, `${prefix}.commit.scope_verified must be true`);
  }
  if (atLeast("PUSHED")) {
    requireValue(errors, typeof bug.push?.remote_sha === "string" && bug.push.remote_sha.length >= 7, `${prefix}.push.remote_sha is required`);
  }
  if (atLeast("DEPLOYED")) {
    for (const key of ["project", "pipeline_id", "job_id", "environment", "sha"]) {
      requireValue(errors, String(bug.deployment?.[key] ?? "").length > 0, `${prefix}.deployment.${key} is required`);
    }
    requireValue(errors, bug.deployment?.status === "success", `${prefix}.deployment.status must be success`);
    requireValue(errors, bug.deployment?.sha === bug.push?.remote_sha, `${prefix} deployment SHA must equal pushed SHA`);
  }
  if (atLeast("MEEGLE_UPDATED")) {
    requireValue(errors, bug.meegle?.business_values_confirmed === true, `${prefix}.meegle.business_values_confirmed must be true`);
    requireValue(errors, bug.meegle?.write_succeeded === true, `${prefix}.meegle.write_succeeded must be true`);
  }
  if (bug?.state === "CLOSED_VERIFIED") {
    requireValue(errors, bug.meegle?.readback?.status === true, `${prefix}.meegle.readback.status must be true`);
    requireValue(errors, bug.meegle?.readback?.fields === true, `${prefix}.meegle.readback.fields must be true`);
    requireValue(errors, bug.meegle?.readback?.comment === true, `${prefix}.meegle.readback.comment must be true`);
  }
  if (bug?.state === "NEEDS_DETAIL") {
    requireValue(errors, typeof bug.detail_request === "string" && bug.detail_request.length > 0, `${prefix}.detail_request is required`);
  }
  return errors;
}

export function validateRunState(state) {
  const errors = [];
  requireValue(errors, Array.isArray(state?.bugs) && state.bugs.length > 0, "bugs must be a non-empty array");
  if (Array.isArray(state?.bugs)) {
    state.bugs.forEach((bug, index) => errors.push(...validateBug(bug, index)));
  }
  return errors;
}

function selfTest() {
  const valid = {
    bugs: [{
      id: "7075150563",
      state: "CLOSED_VERIFIED",
      reproduction: { confirmed: true },
      verification: { focused_tests: "passed", full_tests: "passed", build: "passed" },
      commit: { sha: "abcdef1", scope_verified: true },
      push: { remote_sha: "abcdef123456" },
      deployment: {
        project: "example/project",
        pipeline_id: "1",
        job_id: "2",
        environment: "test",
        sha: "abcdef123456",
        status: "success",
      },
      meegle: {
        business_values_confirmed: true,
        write_succeeded: true,
        readback: { status: true, fields: true, comment: true },
      },
    }],
  };
  const invalid = structuredClone(valid);
  invalid.bugs[0].deployment.status = "running";
  if (validateRunState(valid).length !== 0 || validateRunState(invalid).length === 0) {
    throw new Error("self-test failed");
  }
  console.log("self-test passed");
}

const input = process.argv[2];
if (input === "--self-test") {
  selfTest();
} else if (!input) {
  console.error("Usage: node validate-run-state.mjs <run-state.json> | --self-test");
  process.exitCode = 2;
} else {
  try {
    const errors = validateRunState(JSON.parse(readFileSync(input, "utf8")));
    if (errors.length) {
      errors.forEach((error) => console.error(`- ${error}`));
      process.exitCode = 1;
    } else {
      console.log("run state is valid");
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
