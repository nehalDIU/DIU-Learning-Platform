"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Video, BookOpen, GraduationCap } from "lucide-react"

interface DemoFile {
  id: string
  title: string
  type: "slide" | "video" | "document" | "syllabus" | "study-tool"
  courseTitle: string
  courseCode: string
  topicTitle?: string
}

const demoFiles: DemoFile[] = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    type: "slide",
    courseTitle: "Data Mining and Machine Learning",
    courseCode: "CSE 4108",
    topicTitle: "Lecture 1"
  },
  {
    id: "2", 
    title: "Performance Analysis Video",
    type: "video",
    courseTitle: "Data Mining and Machine Learning",
    courseCode: "CSE 4108",
    topicTitle: "Lecture 12"
  },
  {
    id: "3",
    title: "Algorithm Design Patterns",
    type: "document",
    courseTitle: "Algorithm Design and Analysis",
    courseCode: "CSE 3201",
    topicTitle: "Chapter 5"
  },
  {
    id: "4",
    title: "Course Syllabus",
    type: "syllabus",
    courseTitle: "Software Engineering",
    courseCode: "CSE 3202",
  },
  {
    id: "5",
    title: "Practice Problems",
    type: "study-tool",
    courseTitle: "Data Structures",
    courseCode: "CSE 2201",
    topicTitle: "Trees and Graphs"
  }
]

export function FileTabsDemo() {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

  const addFileToTabs = (file: DemoFile) => {
    const manager = (window as any).multiCourseManager
    if (manager) {
      manager.addContent({
        id: file.id,
        title: file.title,
        type: file.type,
        url: `#demo-${file.id}`,
        courseTitle: file.courseTitle,
        courseCode: file.courseCode,
        topicTitle: file.topicTitle,
        description: `Demo content for ${file.title}`
      })
      setSelectedFiles(prev => new Set([...prev, file.id]))
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "document":
      case "slide":
        return <FileText className="h-4 w-4" />
      case "syllabus":
        return <BookOpen className="h-4 w-4" />
      case "study-tool":
        return <GraduationCap className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "slide":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "document":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "syllabus":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "study-tool":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          File Tabs Demo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on files below to open them in tabs. Try keyboard shortcuts: Ctrl+Tab (switch), Ctrl+W (close), Ctrl+1-9 (jump to tab)
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {demoFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{file.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {file.courseCode}
                    </Badge>
                    <Badge className={`text-xs ${getTypeColor(file.type)}`}>
                      {file.type}
                    </Badge>
                    {file.topicTitle && (
                      <span className="text-xs text-muted-foreground">
                        {file.topicTitle}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {file.courseTitle}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => addFileToTabs(file)}
                disabled={selectedFiles.has(file.id)}
                size="sm"
                variant={selectedFiles.has(file.id) ? "secondary" : "default"}
              >
                {selectedFiles.has(file.id) ? "Opened" : "Open"}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Features:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Multiple files open in tabs with file type icons</li>
            <li>• Responsive design that works on mobile, tablet, and desktop</li>
            <li>• Keyboard shortcuts for quick navigation</li>
            <li>• Professional styling with hover effects and animations</li>
            <li>• Context menu support (right-click on tabs)</li>
            <li>• Tab count indicator and controls</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
