'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Camera, 
  Brain, 
  Database, 
  Users, 
  History,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface DashboardViewProps {
  onViewChange: (view: string) => void
}

const statsCards = [
  {
    title: "Total Detections",
    value: "1,284",
    change: "+12%",
    icon: Eye,
    color: "from-purple-500 to-purple-700",
    description: "AI analyses performed"
  },
  {
    title: "Patients",
    value: "847",
    change: "+5%",
    icon: Users,
    color: "from-blue-500 to-blue-700",
    description: "Registered patients"
  },
  {
    title: "Storage Used",
    value: "2.4 GB",
    change: "+0.8 GB",
    icon: Database,
    color: "from-green-500 to-green-700",
    description: "Local image storage"
  },
  {
    title: "Accuracy Rate",
    value: "94.2%",
    change: "+2.1%",
    icon: TrendingUp,
    color: "from-teal-500 to-teal-700",
    description: "Model performance"
  }
]

const recentActivity = [
  {
    id: 1,
    patient: "John Smith",
    type: "Glaucoma Detection",
    result: "Normal",
    time: "2 hours ago",
    status: "success"
  },
  {
    id: 2,
    patient: "Sarah Johnson",
    type: "Diabetic Retinopathy",
    result: "Mild changes detected",
    time: "4 hours ago",
    status: "warning"
  },
  {
    id: 3,
    patient: "Michael Brown",
    type: "Cataract Analysis",
    result: "Early cataract",
    time: "6 hours ago",
    status: "alert"
  },
  {
    id: 4,
    patient: "Emily Davis",
    type: "Glaucoma Detection",
    result: "Normal",
    time: "8 hours ago",
    status: "success"
  }
]

const quickActions = [
  {
    title: "New Detection",
    description: "Analyze retinal image",
    icon: Camera,
    color: "from-purple-500 to-purple-700",
    action: "detection"
  },
  {
    title: "Add Patient",
    description: "Register new patient",
    icon: Users,
    color: "from-blue-500 to-blue-700",
    action: "patients"
  },
  {
    title: "Training Mode",
    description: "Improve AI model",
    icon: Brain,
    color: "from-green-500 to-green-700",
    action: "training"
  },
  {
    title: "View Reports",
    description: "Generate analytics",
    icon: History,
    color: "from-teal-500 to-teal-700",
    action: "reports"
  }
]

export default function DashboardView({ onViewChange }: DashboardViewProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to RETINA Dashboard
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Monitor your AI-powered eye disease detection system and manage patient care efficiently.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/80">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-white/60 mt-1">
                    {stat.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all duration-300 cursor-pointer"
                  onClick={() => onViewChange(action.action)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-white/60">{action.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-white/60">
                Latest detection results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-400' :
                      activity.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <p className="font-medium text-white">{activity.patient}</p>
                      <p className="text-sm text-white/60">{activity.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/80">{activity.result}</p>
                    <p className="text-xs text-white/50">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                System Status
              </CardTitle>
              <CardDescription className="text-white/60">
                Application health check
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">AI Model</span>
                </div>
                <span className="text-sm text-green-400">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-green-400" />
                  <span className="text-white">Storage</span>
                </div>
                <span className="text-sm text-green-400">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">Camera</span>
                </div>
                <span className="text-sm text-yellow-400">Not Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-green-400" />
                  <span className="text-white">Training</span>
                </div>
                <span className="text-sm text-green-400">Ready</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}