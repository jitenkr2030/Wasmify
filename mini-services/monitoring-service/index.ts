import cron from 'node-cron'

interface Alert {
  id: string
  level: 'info' | 'warning' | 'critical'
  title: string
  message: string
  module?: string
  region?: string
  timestamp: Date
  resolved: boolean
}

interface Metric {
  timestamp: Date
  requests: number
  errors: number
  responseTime: number
  memoryUsage: number
  cpuUsage: number
  activeInstances: number
}

interface Threshold {
  metric: string
  operator: '>' | '<' | '=' | '>=' | '<='
  value: number
  level: 'warning' | 'critical'
  message: string
}

class MonitoringService {
  private alerts: Alert[] = []
  private metrics: Metric[] = []
  private thresholds: Threshold[] = [
    { metric: 'errorRate', operator: '>', value: 5, level: 'critical', message: 'Error rate exceeded 5%' },
    { metric: 'responseTime', operator: '>', value: 1000, level: 'warning', message: 'Response time above 1s' },
    { metric: 'memoryUsage', operator: '>', value: 90, level: 'critical', message: 'Memory usage above 90%' },
    { metric: 'cpuUsage', operator: '>', value: 80, level: 'warning', message: 'CPU usage above 80%' },
    { metric: 'activeInstances', operator: '<', value: 1, level: 'critical', message: 'No active instances' }
  ]

  constructor() {
    this.initializeMonitoring()
  }

  private initializeMonitoring() {
    console.log('Monitoring service started on port 3002')

    // Check metrics every minute
    cron.schedule('* * * * *', () => {
      this.collectMetrics()
      this.checkThresholds()
    })

    // Cleanup old data every hour
    cron.schedule('0 * * * *', () => {
      this.cleanupOldData()
    })

    // Generate health report every 6 hours
    cron.schedule('0 */6 * * *', () => {
      this.generateHealthReport()
    })
  }

  private collectMetrics() {
    // Simulate metric collection
    const metric: Metric = {
      timestamp: new Date(),
      requests: Math.floor(Math.random() * 1000) + 500,
      errors: Math.floor(Math.random() * 50),
      responseTime: Math.floor(Math.random() * 200) + 20,
      memoryUsage: Math.floor(Math.random() * 100),
      cpuUsage: Math.floor(Math.random() * 100),
      activeInstances: Math.floor(Math.random() * 10) + 1
    }

    this.metrics.push(metric)
    console.log(`Collected metrics: ${JSON.stringify(metric)}`)
  }

  private checkThresholds() {
    if (this.metrics.length === 0) return

    const latestMetric = this.metrics[this.metrics.length - 1]
    const errorRate = (latestMetric.errors / latestMetric.requests) * 100

    // Check each threshold
    this.thresholds.forEach(threshold => {
      let value = 0

      switch (threshold.metric) {
        case 'errorRate':
          value = errorRate
          break
        case 'responseTime':
          value = latestMetric.responseTime
          break
        case 'memoryUsage':
          value = latestMetric.memoryUsage
          break
        case 'cpuUsage':
          value = latestMetric.cpuUsage
          break
        case 'activeInstances':
          value = latestMetric.activeInstances
          break
      }

      if (this.evaluateThreshold(value, threshold.operator, threshold.value)) {
        this.createAlert({
          level: threshold.level,
          title: `${threshold.metric} threshold exceeded`,
          message: `${threshold.message}: ${value.toFixed(2)} (threshold: ${threshold.value})`,
          timestamp: new Date()
        })
      }
    })
  }

  private evaluateThreshold(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold
      case '<': return value < threshold
      case '>=': return value >= threshold
      case '<=': return value <= threshold
      case '=': return value === threshold
      default: return false
    }
  }

  private createAlert(alertData: Omit<Alert, 'id' | 'resolved'>) {
    const alert: Alert = {
      ...alertData,
      id: Date.now().toString(),
      resolved: false
    }

    this.alerts.push(alert)
    console.log(`🚨 ALERT [${alert.level.toUpperCase()}]: ${alert.title} - ${alert.message}`)

    // In a real implementation, you would send notifications here
    this.sendNotification(alert)
  }

  private sendNotification(alert: Alert) {
    // Simulate sending notification
    console.log(`Sending notification for alert: ${alert.id}`)
    
    // In a real implementation, you would:
    // - Send email
    // - Send Slack notification
    // - Send SMS
    // - Push to webhook
    // - Update monitoring dashboard
  }

  private cleanupOldData() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    // Clean up old metrics
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo)
    
    // Clean up resolved alerts older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    this.alerts = this.alerts.filter(alert => 
      !alert.resolved || alert.timestamp > oneDayAgo
    )

    console.log('Cleaned up old monitoring data')
  }

  private generateHealthReport() {
    const totalAlerts = this.alerts.length
    const criticalAlerts = this.alerts.filter(a => a.level === 'critical' && !a.resolved).length
    const warningAlerts = this.alerts.filter(a => a.level === 'warning' && !a.resolved).length

    const avgResponseTime = this.metrics.length > 0 
      ? this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length 
      : 0

    const avgErrorRate = this.metrics.length > 0
      ? this.metrics.reduce((sum, m) => sum + (m.errors / m.requests), 0) / this.metrics.length * 100
      : 0

    const report = {
      timestamp: new Date(),
      totalAlerts,
      activeAlerts: criticalAlerts + warningAlerts,
      criticalAlerts,
      warningAlerts,
      avgResponseTime: avgResponseTime.toFixed(2),
      avgErrorRate: avgErrorRate.toFixed(2),
      uptime: '99.97%',
      status: criticalAlerts > 0 ? 'degraded' : warningAlerts > 0 ? 'warning' : 'healthy'
    }

    console.log(`📊 Health Report: ${JSON.stringify(report, null, 2)}`)
    
    // Send health report to monitoring systems
    this.sendHealthReport(report)
  }

  private sendHealthReport(report: any) {
    // In a real implementation, you would:
    // - Send to Prometheus/Grafana
    // - Send to DataDog
    // - Send to New Relic
    // - Update status page
    console.log('Health report sent to monitoring systems')
  }

  // Public API methods
  public getAlerts(): Alert[] {
    return this.alerts
  }

  public getMetrics(): Metric[] {
    return this.metrics
  }

  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      console.log(`Resolved alert: ${alertId}`)
      return true
    }
    return false
  }

  public addThreshold(threshold: Threshold): void {
    this.thresholds.push(threshold)
    console.log(`Added threshold: ${JSON.stringify(threshold)}`)
  }

  public removeThreshold(metric: string): boolean {
    const index = this.thresholds.findIndex(t => t.metric === metric)
    if (index > -1) {
      this.thresholds.splice(index, 1)
      console.log(`Removed threshold for: ${metric}`)
      return true
    }
    return false
  }
}

// Initialize monitoring service
const monitoringService = new MonitoringService()

// Simple HTTP API for the monitoring service
import { createServer } from 'http'

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'GET' && req.url === '/alerts') {
    res.writeHead(200)
    res.end(JSON.stringify({ success: true, data: monitoringService.getAlerts() }))
  } else if (req.method === 'GET' && req.url === '/metrics') {
    res.writeHead(200)
    res.end(JSON.stringify({ success: true, data: monitoringService.getMetrics() }))
  } else if (req.method === 'POST' && req.url?.startsWith('/alerts/')) {
    const alertId = req.url.split('/').pop()
    if (alertId && alertId !== 'resolve') {
      const resolved = monitoringService.resolveAlert(alertId)
      res.writeHead(resolved ? 200 : 404)
      res.end(JSON.stringify({ 
        success: resolved, 
        message: resolved ? 'Alert resolved' : 'Alert not found' 
      }))
    }
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }))
  }
})

server.listen(3002, () => {
  console.log('Monitoring API server running on port 3002')
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down monitoring service...')
  server.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Shutting down monitoring service...')
  server.close()
  process.exit(0)
})