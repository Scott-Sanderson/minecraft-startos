import { VersionGraph } from '@start9labs/start-sdk'
import { v_26_1_2_0_a1 } from './v26.1.2.0.a1'
import { v_26_1_2_0_a0 } from './v26.1.2.0.a0'
import { v_26_1_0_0_a2 } from './v26.1.0.0.a2'
import { v_26_1_0_0_a1 } from './v26.1.0.0.a1'
import { v_26_1_0_0_a0 } from './v26.1.0.0.a0'

export const versionGraph = VersionGraph.of({
  current: v_26_1_2_0_a1,
  other: [v_26_1_2_0_a0, v_26_1_0_0_a2, v_26_1_0_0_a1, v_26_1_0_0_a0],
})
