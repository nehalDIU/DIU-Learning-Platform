import { NextRequest, NextResponse } from 'next/server'

// Mock data for demo purposes
const mockTopics = {
  "sample-course-1": [
    {
      id: "topic-1",
      title: "Performance Analysis",
      description: "Understanding algorithm performance and complexity analysis",
      order_index: 1,
      slides: [
        {
          id: "slide-1-1",
          title: "Introduction to Performance Analysis",
          google_drive_url: "https://drive.google.com/file/d/sample1",
          order_index: 1
        },
        {
          id: "slide-1-2", 
          title: "Big O Notation and Time Complexity",
          google_drive_url: "https://drive.google.com/file/d/sample2",
          order_index: 2
        }
      ],
      videos: [
        {
          id: "video-1-1",
          title: "Performance Analysis Lecture",
          youtube_url: "https://youtube.com/watch?v=sample1",
          order_index: 1
        }
      ]
    },
    {
      id: "topic-2",
      title: "Decision Tree",
      description: "Decision tree algorithms and implementation",
      order_index: 2,
      slides: [
        {
          id: "slide-2-1",
          title: "Decision Tree Fundamentals",
          google_drive_url: "https://drive.google.com/file/d/sample3",
          order_index: 1
        }
      ],
      videos: [
        {
          id: "video-2-1",
          title: "Decision Tree Implementation",
          youtube_url: "https://youtube.com/watch?v=sample2",
          order_index: 1
        }
      ]
    },
    {
      id: "topic-3",
      title: "K-Means Clustering",
      description: "Unsupervised learning with K-Means algorithm",
      order_index: 3,
      slides: [
        {
          id: "slide-3-1",
          title: "Introduction to Clustering",
          google_drive_url: "https://drive.google.com/file/d/sample4",
          order_index: 1
        },
        {
          id: "slide-3-2",
          title: "K-Means Algorithm Deep Dive",
          google_drive_url: "https://drive.google.com/file/d/sample5",
          order_index: 2
        }
      ],
      videos: [
        {
          id: "video-3-1",
          title: "K-Means Clustering Tutorial",
          youtube_url: "https://youtube.com/watch?v=sample3",
          order_index: 1
        }
      ]
    },
    {
      id: "topic-4",
      title: "Association Rule Mining (Theory)",
      description: "Theoretical foundations of association rule mining",
      order_index: 4,
      slides: [
        {
          id: "slide-4-1",
          title: "Association Rules Overview",
          google_drive_url: "https://drive.google.com/file/d/sample6",
          order_index: 1
        }
      ],
      videos: []
    },
    {
      id: "topic-5",
      title: "Association Rule Mining (Apriori & FP-Growth)",
      description: "Practical algorithms for association rule mining",
      order_index: 5,
      slides: [
        {
          id: "slide-5-1",
          title: "Apriori Algorithm",
          google_drive_url: "https://drive.google.com/file/d/sample7",
          order_index: 1
        },
        {
          id: "slide-5-2",
          title: "FP-Growth Algorithm",
          google_drive_url: "https://drive.google.com/file/d/sample8",
          order_index: 2
        }
      ],
      videos: [
        {
          id: "video-5-1",
          title: "Apriori vs FP-Growth Comparison",
          youtube_url: "https://youtube.com/watch?v=sample4",
          order_index: 1
        }
      ]
    },
    {
      id: "topic-6",
      title: "DB SCAN",
      description: "Density-based clustering algorithm",
      order_index: 6,
      slides: [
        {
          id: "slide-6-1",
          title: "DBSCAN Clustering",
          google_drive_url: "https://drive.google.com/file/d/sample9",
          order_index: 1
        }
      ],
      videos: [
        {
          id: "video-6-1",
          title: "DBSCAN Implementation Guide",
          youtube_url: "https://youtube.com/watch?v=sample5",
          order_index: 1
        }
      ]
    },
    {
      id: "topic-7",
      title: "Artificial Neural Networks (ANN)",
      description: "Introduction to neural networks and deep learning",
      order_index: 7,
      slides: [
        {
          id: "slide-7-1",
          title: "Neural Network Basics",
          google_drive_url: "https://drive.google.com/file/d/sample10",
          order_index: 1
        },
        {
          id: "slide-7-2",
          title: "Backpropagation Algorithm",
          google_drive_url: "https://drive.google.com/file/d/sample11",
          order_index: 2
        }
      ],
      videos: [
        {
          id: "video-7-1",
          title: "Neural Networks Explained",
          youtube_url: "https://youtube.com/watch?v=sample6",
          order_index: 1
        },
        {
          id: "video-7-2",
          title: "Building Your First Neural Network",
          youtube_url: "https://youtube.com/watch?v=sample7",
          order_index: 2
        }
      ]
    }
  ],
  "sample-course-2": [
    {
      id: "topic-db-1",
      title: "Advanced SQL and Query Optimization",
      description: "Complex queries and performance optimization techniques",
      order_index: 1,
      slides: [
        {
          id: "slide-db-1-1",
          title: "Advanced SQL Techniques",
          google_drive_url: "https://drive.google.com/file/d/sampledb1",
          order_index: 1
        }
      ],
      videos: [
        {
          id: "video-db-1-1",
          title: "SQL Optimization Strategies",
          youtube_url: "https://youtube.com/watch?v=sampledb1",
          order_index: 1
        }
      ]
    },
    {
      id: "topic-db-2",
      title: "NoSQL Database Systems",
      description: "MongoDB, Cassandra, and other NoSQL solutions",
      order_index: 2,
      slides: [
        {
          id: "slide-db-2-1",
          title: "Introduction to NoSQL",
          google_drive_url: "https://drive.google.com/file/d/sampledb2",
          order_index: 1
        }
      ],
      videos: []
    }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const topics = mockTopics[id as keyof typeof mockTopics] || []
  
  return NextResponse.json(topics)
}
