export function register() {
  if (typeof performance !== "undefined" && performance.measure) {
    const originalMeasure = performance.measure.bind(performance)
    performance.measure = function (measureName: string, startOrOptions?: any, endMark?: string) {
      try {
        return originalMeasure(measureName, startOrOptions, endMark)
      } catch {
        return undefined as any
      }
    }
  }
}
