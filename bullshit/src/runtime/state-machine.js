class StateMachine {
  constructor () {
    // Begin States
    // ------------
    this.AGGRESSIVE_PURE_RENDERER_CORE_PLUGIN_SCHEDULER_GETTER_BIT = 0
    this.AGGRESSIVE_PURE_RENDERER_CORE_PLUGIN_SCHEDULER_SETTER_BIT = 0

    this.CORE_PLUGIN_SCHEDULER_DATA_GETTER_BIT = 0
    this.CORE_PLUGIN_SCHEDULER_DATA_SETTER_BIT = 0
    // ----------
    // End States

    // Begin Side Effects
    // ------------------
    this.AGGRESSIVE_PURE_RENDERER_ACCESS_COUNT = 0
    this.CORE_PLUGIN_SCHEDULER_ACCESS_COUNT = 0
    // ----------------
    // End Side Effects
  }

  transduce (instruction) {
    const MAPPING = {
      AGGRESSIVE_PURE_RENDERER () {
        switch (instruction.code) {
          // Case 0x01
          case 0x01:
            this.AGGRESSIVE_PURE_RENDERER_CORE_PLUGIN_SCHEDULER_GETTER_BIT = (
              !this.AGGRESSIVE_PURE_RENDERER_CORE_PLUGIN_SCHEDULER_GETTER_BIT
            )
            break

          // Case 0x02
          case 0x02:
            this.AGGRESSIVE_PURE_RENDERER_CORE_PLUGIN_SCHEDULER_SETTER_BIT = (
              !this.AGGRESSIVE_PURE_RENDERER_CORE_PLUGIN_SCHEDULER_SETTER_BIT
            )
            break

          // Case 0x03
          case 0x03:
            // TODO
            break
        }
      },
      CORE_PLUGIN_SCHEDULER () {

      }
    }

    MAPPING[instruction.type]()
    // this.XX_COUNT++
  }
}

export default StateMachine
