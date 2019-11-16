import CorePluginScheduler from './core-plugin-scheduler.js'

class AggressivePureRenderer {
  constructor () {
    this.corePluginScheduler = new CorePluginScheduler()
  }

  /**
   * Set Core Plugin Scheduler
   */
  setCorePluginScheduler (corePluginScheduler) {
    // TODO
  }

  /**
   * Get Core Plugin Scheduler
   */
  getCorePluginScheduler () {
    return this.coreScheduler
  }
}

export default AggressivePureRenderer
