"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, FileText, RefreshCw } from "lucide-react"

export function StatePersistenceTest() {
  const [tabStates, setTabStates] = useState<any>({})
  const [activeTab, setActiveTab] = useState<any>(null)
  const [tabs, setTabs] = useState<any[]>([])

  const refreshStates = () => {
    const manager = (window as any).multiCourseManager
    if (manager) {
      setTabStates(manager.getTabStates())
      setActiveTab(manager.getActiveTab())
      setTabs(manager.getTabs())
    }
  }

  useEffect(() => {
    const interval = setInterval(refreshStates, 1000)
    return () => clearInterval(interval)
  }, [])

  const testVideos = [
    {
      id: "test-video-1",
      title: "Machine Learning Basics",
      type: "video" as const,
      url: "https://www.youtube.com/watch?v=ukzFI9rgwfU",
      courseTitle: "Data Mining and Machine Learning",
      courseCode: "CSE 4108",
      topicTitle: "Introduction"
    },
    {
      id: "test-video-2", 
      title: "Deep Learning Fundamentals",
      type: "video" as const,
      url: "https://www.youtube.com/watch?v=aircAruvnKk",
      courseTitle: "Neural Networks",
      courseCode: "CSE 4109",
      topicTitle: "Basics"
    }
  ]

  const testDocuments = [
    {
      id: "test-doc-1",
      title: "Algorithm Analysis Slides",
      type: "slide" as const,
      url: "https://docs.google.com/presentation/d/1BmgtVZ7dWWWZvJKl8Xz8QqJqKqJqKqJq/edit",
      courseTitle: "Algorithm Design",
      courseCode: "CSE 3201",
      topicTitle: "Time Complexity"
    },
    {
      id: "test-doc-2",
      title: "Software Engineering Notes",
      type: "document" as const,
      url: "https://docs.google.com/document/d/1BmgtVZ7dWWWZvJKl8Xz8QqJqKqJqKqJq/edit",
      courseTitle: "Software Engineering",
      courseCode: "CSE 3202",
      topicTitle: "Design Patterns"
    }
  ]

  const addTestContent = (content: any) => {
    const manager = (window as any).multiCourseManager
    if (manager) {
      manager.addContent(content)
      setTimeout(refreshStates, 100)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            State Persistence Test Dashboard
          </CardTitle>
          <Button onClick={refreshStates} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Test video and document state persistence. Open multiple files, interact with them, then switch between tabs to verify state is maintained.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Content */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Play className="h-4 w-4 text-red-500" />
              Test Videos
            </h3>
            <div className="space-y-2">
              {testVideos.map((video) => (
                <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.courseCode}</p>
                  </div>
                  <Button onClick={() => addTestContent(video)} size="sm">
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Test Documents
            </h3>
            <div className="space-y-2">
              {testDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.courseCode}</p>
                  </div>
                  <Button onClick={() => addTestContent(doc)} size="sm">
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current State */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-3">Active Tab</h3>
            {activeTab ? (
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="font-medium">{activeTab.title}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{activeTab.type}</Badge>
                  <Badge variant="outline">{activeTab.courseCode}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No active tab</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3">Open Tabs ({tabs.length})</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {tabs.map((tab) => (
                <div key={tab.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <span className={tab.isActive ? "font-medium" : ""}>{tab.title}</span>
                  <Badge variant={tab.isActive ? "default" : "secondary"} className="text-xs">
                    {tab.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Saved States */}
        <div>
          <h3 className="font-semibold mb-3">Saved States</h3>
          {Object.keys(tabStates).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(tabStates).map(([tabId, state]: [string, any]) => (
                <div key={tabId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">Tab: {tabId}</p>
                    <Badge variant="outline" className="text-xs">
                      {new Date(state.lastAccessTime).toLocaleTimeString()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {state.videoCurrentTime !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Video Time:</span>
                        <p className="font-mono">{formatTime(state.videoCurrentTime)}</p>
                      </div>
                    )}
                    {state.videoDuration !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-mono">{formatTime(state.videoDuration)}</p>
                      </div>
                    )}
                    {state.videoPlaybackRate !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Speed:</span>
                        <p className="font-mono">{state.videoPlaybackRate}x</p>
                      </div>
                    )}
                    {state.scrollPosition !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Scroll:</span>
                        <p className="font-mono">{Math.round(state.scrollPosition)}px</p>
                      </div>
                    )}
                    {state.isVideoPlaying !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Playing:</span>
                        <p className="font-mono">{state.isVideoPlaying ? "Yes" : "No"}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No saved states yet. Open some content and interact with it!</p>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Testing Instructions:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>Open a test video and let it play for a few seconds</li>
            <li>Open another file (video or document)</li>
            <li>Switch back to the first video - it should resume from where you left off</li>
            <li>For documents, scroll down then switch tabs and return - scroll position should be maintained</li>
            <li>Check the "Saved States" section to see the persistence data</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
