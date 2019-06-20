/*
 * Copyright (C) 2018 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as Joi from "joi"
import { taskActionParamsSchema, PluginTaskActionParamsBase } from "../base"
import { dedent, deline } from "../../../util/string"
import { Module } from "../../module"
import { moduleVersionSchema, ModuleVersion } from "../../../vcs/vcs"

export const taskVersionSchema = moduleVersionSchema
  .description(deline`
    The task run's version. In addition to the parent module's version, this also
    factors in the module versions of the tasks's runtime dependencies (if any).`)

export interface GetTaskResultParams<T extends Module = Module> extends PluginTaskActionParamsBase<T> {
  taskVersion: ModuleVersion
}

export const taskResultSchema = Joi.object()
  .keys({
    moduleName: Joi.string()
      .description("The name of the module that the task belongs to."),
    taskName: Joi.string()
      .description("The name of the task that was run."),
    command: Joi.array().items(Joi.string())
      .required()
      .description("The command that the task ran in the module."),
    version: moduleVersionSchema,
    success: Joi.boolean()
      .required()
      .description("Whether the task was successfully run."),
    startedAt: Joi.date()
      .required()
      .description("When the task run was started."),
    completedAt: Joi.date()
      .required()
      .description("When the task run was completed."),
    output: Joi.string()
      .required()
      .allow("")
      .description("The output log from the run."),
  })

export const getTaskResult = {
  description: dedent`
    Retrieve the task result for the specified version. Use this along with the \`runTask\` handler
    to avoid running the same task repeatedly when its dependencies haven't changed.

    Note that the version string provided to this handler may be a hash of the module's version, as
    well as any runtime dependencies configured for the task, so it may not match the current version
    of the module itself.
  `,
  paramsSchema: taskActionParamsSchema
    .keys({
      taskVersion: taskVersionSchema,
    }),

  resultSchema: taskResultSchema.allow(null),
}