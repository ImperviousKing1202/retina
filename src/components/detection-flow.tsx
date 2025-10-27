'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Brain,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react'

type DetectionStep = 'instructions' | 'capture' | 'analyzing' | 'results'
type DiseaseType = 'glaucoma' | 'retinopathy' | 'cataract'

interface DetectionFlowProps {
  diseaseType: DiseaseType
  onClose: () => void
}

interface DetectionResult {
  result: 'positive' | 'negative' | 'inconclusive'
  confidence: number
  details: string
  recommendations: string[]
}

const diseaseInstructions = {
  glaucoma: {
    title: 'Glaucoma Detection',
    description: 'Follow these steps for accurate glaucoma screening',
    steps: [
      'Ensure good lighting conditions',
      'Remove glasses or contact lenses if possible',
      'Focus on a distant point for 30 seconds before capture',
      'Keep your eyes open and steady during capture',
      'Take multiple images for best results'
    ]
  },
  retinopathy: {
    title: 'Diabetic Retinopathy Screening',
    description: 'Prepare for retinal analysis',
    steps: [
      'Darken the room slightly for better pupil dilation',
      'Look straight ahead at the camera',
      'Avoid blinking during the capture',
      'If you have diabetes, ensure your blood sugar is stable',
          'Take images of both eyes if possible'
    ]
  },
  cataract: {
    title: 'Cataract Analysis',
    description: 'Getting ready for cataract detection',
    steps: [
      'Face a bright light source for pupil constriction',
      'Remove any protective eyewear',
          'Keep your head steady and eyes focused',
      'Capture images from different angles if possible',
      'Ensure the lens area is clearly visible'
    ]
  }
}

export default function DetectionFlow({ diseaseType, onClose }: DetectionFlowProps) {
  const [currentStep, setCurrentStep] = useState<DetectionStep>('instructions')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isUsingCamera, setIsUsingCamera] = useState(false)

  const instructions = diseaseInstructions[diseaseType]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
        setCurrentStep('analyzing')
        analyzeImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsUsingCamera(true)
      }
    } catch (err) {
      setError('Camera access denied. Please use file upload instead.')
    }
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg')
      setCapturedImage(imageData)
      setIsUsingCamera(false)
      stopCamera()
      setCurrentStep('analyzing')
      analyzeImage(imageData)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          diseaseType
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setDetectionResult(result)
      setAnalysisProgress(100)
      setCurrentStep('results')
    } catch (err) {
      setError('Analysis failed. Please try again.')
      setCurrentStep('capture')
    } finally {
      setIsAnalyzing(false)
      clearInterval(progressInterval)
    }
  }

  const resetDetection = () => {
    setCurrentStep('instructions')
    setCapturedImage(null)
    setDetectionResult(null)
    setError(null)
    setAnalysisProgress(0)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'instructions':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-teal-500 flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{instructions.title}</CardTitle>
              <CardDescription>{instructions.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-600">{step}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <Button 
                  variant="outline"
                  onClick={startCamera}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Use Camera
                </Button>
              </div>
              
              <Button variant="ghost" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </CardContent>
          </motion.div>
        )

      case 'capture':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardHeader className="text-center">
              <CardTitle>Capture Retinal Image</CardTitle>
              <CardDescription>
                Position your eye properly and capture a clear image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isUsingCamera ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none" />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={captureImage}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capture
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        stopCamera()
                        setIsUsingCamera(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Click to upload or drag and drop</p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                    >
                      Choose File
                    </Button>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={startCamera}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Use Camera Instead
                  </Button>
                </div>
              )}
              
              <Button variant="ghost" onClick={() => setCurrentStep('instructions')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Instructions
              </Button>
            </CardContent>
          </motion.div>
        )

      case 'analyzing':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-teal-500 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white animate-pulse" />
              </div>
              <CardTitle>Analyzing Your Image</CardTitle>
              <CardDescription>
                Our AI is examining your retinal image for signs of {diseaseType}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {capturedImage && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={capturedImage} 
                    alt="Captured retinal image" 
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analysis Progress</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
              
              <div className="text-center text-sm text-gray-600">
                {isAnalyzing && (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing neural network analysis...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </motion.div>
        )

      case 'results':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                detectionResult?.result === 'negative' 
                  ? 'bg-green-100' 
                  : detectionResult?.result === 'positive'
                  ? 'bg-red-100'
                  : 'bg-yellow-100'
              }`}>
                {detectionResult?.result === 'negative' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : detectionResult?.result === 'positive' ? (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {detectionResult?.result === 'negative' 
                  ? 'No Signs Detected' 
                  : detectionResult?.result === 'positive'
                  ? 'Signs Detected'
                  : 'Inconclusive Results'
                }
              </CardTitle>
              <CardDescription>
                Confidence: {detectionResult?.confidence ? Math.round(detectionResult.confidence * 100) : 0}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {detectionResult && (
                <>
                  <Alert>
                    <AlertDescription>
                      {detectionResult.details}
                    </AlertDescription>
                  </Alert>
                  
                  {detectionResult.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Recommendations:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {detectionResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex gap-3">
                <Button 
                  onClick={resetDetection}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
                <Button 
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-md bg-white/95 border-white/20">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </Card>
      </motion.div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {error && (
        <Alert className="mt-4 max-w-md mx-auto bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}