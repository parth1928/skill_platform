"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string) => void
  userName: string
}

export function ImageUpload({ currentImage, onImageChange, userName }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onImageChange(result)
      setIsUploading(false)
      toast({
        title: "Image uploaded",
        description: "Your profile picture has been updated",
      })
    }
    reader.onerror = () => {
      setIsUploading(false)
      toast({
        title: "Upload failed",
        description: "Failed to read the image file",
        variant: "destructive",
      })
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    onImageChange("")
    toast({
      title: "Image removed",
      description: "Profile picture has been reset to default",
    })
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Profile Picture</Label>

      <div className="flex items-start gap-4">
        {/* Current Avatar Preview */}
        <Avatar className="w-20 h-20 border-2 border-gray-200">
          <AvatarImage src={currentImage || "/placeholder.svg"} alt={userName} />
          <AvatarFallback className="text-xl">{userName.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Upload Area */}
        <div className="flex-1 space-y-3">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
              ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}
              ${isUploading ? "opacity-50 pointer-events-none" : ""}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="space-y-2">
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              )}

              <div className="text-sm">
                <p className="font-medium text-gray-700">
                  {isUploading ? "Uploading..." : "Drop image here or click to browse"}
                </p>
                <p className="text-gray-500 text-xs mt-1">JPG, PNG, GIF up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={isUploading}
              className="flex-1 bg-transparent"
            >
              <Camera className="h-4 w-4 mr-2" />
              Choose File
            </Button>

            {currentImage && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeImage}
                disabled={isUploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
