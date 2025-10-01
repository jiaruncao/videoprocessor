# Video Background Remover Component Documentation

## 📋 Overview

This is a Vue2 + Element UI component for video background removal functionality. It provides a professional interface for users to upload videos and remove/replace backgrounds with green screen or transparent effects, fully replicating the HTML version's features and styling.

## 🎯 Features

### 1. Video Upload
- **Drag & Drop Support**: Drag files directly into the upload area
- **Click Upload**: Click to browse and select files
- **Paste Support**: Paste files from clipboard
- **Multi-file Support**: Up to 8 files can be uploaded simultaneously
- **Format Support**: .mp4, .mov, .m4v, .3gp, .avi
- **Size Limit**: Maximum 500MB per file
- **Visual Feedback**: Success badge appears after upload

### 2. Background Options
- **Green Screen**: Replace background with green color (#00ff00)
- **Transparent**: Replace background with transparent (shown as checkerboard pattern)
- **Real-time Preview**: See changes immediately after processing

### 3. Canvas-based Video Processing
- **Original Canvas**: Displays the original video
- **Processed Canvas**: Shows video with background removed
- **Frame-by-frame Processing**: Real-time video frame processing
- **5-second Preview**: Limited preview duration for demonstration

### 4. Video Controls
- **Play/Pause**: Control video playback
- **Preview Mode**: 5-second loop preview
- **Synchronized Playback**: Both canvases play in sync

### 5. Download Options
- **5s Preview Video**: Free download of 5-second preview
- **Full Video**: Pro members can download the complete processed video

## 📦 Installation

### Prerequisites

```bash
# Install Vue2
npm install vue@2.x

# Install Element UI
npm install element-ui@2.15.14

# Install Sass support
npm install sass sass-loader node-sass --save-dev
```

### Import in Main.js

```javascript
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
```

## 🚀 Usage

### Basic Usage

```vue
<template>
  <video-background-remover />
</template>

<script>
import VideoBackgroundRemover from '@/components/VideoBackgroundRemover.vue'

export default {
  components: {
    VideoBackgroundRemover
  }
}
</script>
```

### In Router Configuration

```javascript
{
  path: '/background-remover',
  name: 'VideoBackgroundRemover',
  component: () => import('@/components/VideoBackgroundRemover.vue')
}
```

## 📁 File Structure

```
components/
├── VideoBackgroundRemover.vue    # Main Vue component
├── VideoBackgroundRemover.scss   # Component styles
└── README.md                      # Documentation

assets/
└── videos/                        # Sample video files (optional)
```

## 🎨 Styling

### Theme Colors
- **Primary**: `#6366f1` → `#8b5cf6` (Purple gradient)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Error**: `#ef4444` (Red)
- **Background**: `#f8f9fb` (Light gray)

### Key Style Classes
- `.video-background-remover-page` - Main container
- `.sidebar` - Side navigation
- `.main-container` - Main content area
- `.upload-area` - Upload zone
- `.canvas-wrapper` - Canvas container
- `.comparison-section` - Comparison display area

## 🔧 Component Configuration

### Props
The component currently has no external props. All configuration is managed through internal data.

### Data Properties

```javascript
data() {
  return {
    // Menu items
    menuItems: [],           // Navigation menu configuration
    
    // File handling
    currentFile: null,       // Current uploaded file
    fileName: '',           // File name
    previewUrl: '',         // Preview URL
    filePreview: false,     // Show file preview
    hasFile: false,         // File uploaded flag
    uploadSuccess: false,   // Upload success flag
    isDragover: false,      // Drag over state
    
    // Processing
    backgroundMode: 'green', // 'green' or 'transparent'
    processing: false,       // Processing state
    processingComplete: false, // Processing complete flag
    processPercent: 0,      // Processing progress
    
    // Canvas
    canvasWidth: 640,       // Canvas width
    canvasHeight: 480,      // Canvas height
    originalVideo: null,    // Original video element
    originalCtx: null,      // Original canvas context
    processedCtx: null,     // Processed canvas context
    isPlaying: false,       // Playback state
    animationId: null      // Animation frame ID
  }
}
```

### Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `initCanvas()` | Initialize canvas contexts | - | void |
| `handleMenuClick(index)` | Handle menu navigation | index: Number | void |
| `triggerFileInput()` | Trigger file input dialog | - | void |
| `handleFiles(files)` | Process uploaded files | files: FileList | void |
| `displayPreview(file)` | Display file preview | file: File | void |
| `showVideoInCanvas()` | Display video in canvas | - | void |
| `removeFile()` | Remove uploaded file | - | void |
| `handleBackgroundChange()` | Handle background mode change | - | void |
| `startProcessing()` | Start background removal | - | void |
| `showProcessedResult()` | Show processed result | - | void |
| `drawProcessedFrame()` | Draw processed video frame | - | void |
| `togglePlay(type)` | Toggle play/pause | type: String | void |
| `startAnimation()` | Start animation loop | - | void |
| `stopAnimation()` | Stop animation loop | - | void |
| `downloadPreview()` | Download preview video | - | void |
| `downloadFull()` | Download full video | - | void |

## 🔄 Video Processing Algorithm

### Background Removal Process

1. **Frame Capture**: Extract video frame to canvas
2. **Pixel Analysis**: Analyze each pixel's RGB values
3. **Background Detection**: Simple threshold-based detection
4. **Alpha Channel Modification**: Set background pixels to transparent
5. **Background Replacement**: Apply green screen or transparent background
6. **Frame Rendering**: Draw processed frame to output canvas

### Simplified Algorithm Example

```javascript
// Simple background detection based on brightness
for (let i = 0; i < imageData.data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  
  // Calculate brightness
  const brightness = (r + g + b) / 3
  
  // Simple threshold detection
  if (brightness > 180 && brightness < 220) {
    // Set alpha channel to 0 (transparent)
    data[i + 3] = 0
  }
}
```

## 📱 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## ⚠️ Important Notes

### Performance Considerations
1. **Video Size**: Large videos may impact performance
2. **Frame Rate**: Processing is limited to browser animation frame rate
3. **Memory Usage**: Canvas operations consume memory, clean up when done

### Limitations
1. **Simple Algorithm**: Current implementation uses basic threshold detection
2. **Preview Only**: 5-second preview limitation
3. **Client-side Processing**: All processing happens in the browser

### Security
1. **File Validation**: Always validate file type and size
2. **CORS**: Ensure video sources comply with CORS policies
3. **Memory Cleanup**: Properly dispose of video elements and canvas contexts

## 🛠 Customization

### Adding New Background Options

```javascript
// Add new background mode in data
backgroundMode: 'custom', // Add 'custom' option

// Update drawProcessedFrame method
if (this.backgroundMode === 'custom') {
  // Custom background implementation
  this.processedCtx.fillStyle = 'yourCustomPattern'
  this.processedCtx.fillRect(0, 0, width, height)
}
```

### Modifying Processing Algorithm

```javascript
// Enhance background detection algorithm
drawProcessedFrame() {
  // Implement more sophisticated algorithms:
  // - Machine learning-based segmentation
  // - Color range keying
  // - Edge detection
  // - Motion detection
}
```

### Integration with Backend API

```javascript
async processVideoOnServer() {
  const formData = new FormData()
  formData.append('video', this.currentFile)
  formData.append('mode', this.backgroundMode)
  
  try {
    const response = await axios.post('/api/process-video', formData, {
      onUploadProgress: (progressEvent) => {
        this.processPercent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
      }
    })
    
    this.processedVideoUrl = response.data.url
  } catch (error) {
    this.$message.error('Processing failed')
  }
}
```

## 🔌 Events

The component can emit custom events for parent component integration:

```javascript
// Emit upload complete
this.$emit('upload-complete', {
  file: this.currentFile,
  url: this.previewUrl
})

// Emit processing complete
this.$emit('processing-complete', {
  originalUrl: this.previewUrl,
  processedUrl: this.processedVideoUrl,
  mode: this.backgroundMode
})

// Emit download request
this.$emit('download-request', {
  type: 'preview', // or 'full'
  url: this.processedVideoUrl
})
```

## 📊 State Management (Vuex)

### Store Module Example

```javascript
// store/modules/videoProcessor.js
export default {
  namespaced: true,
  
  state: {
    currentVideo: null,
    processingStatus: 'idle',
    backgroundMode: 'green',
    processedVideos: []
  },
  
  mutations: {
    SET_VIDEO(state, video) {
      state.currentVideo = video
    },
    SET_STATUS(state, status) {
      state.processingStatus = status
    },
    SET_MODE(state, mode) {
      state.backgroundMode = mode
    },
    ADD_PROCESSED_VIDEO(state, video) {
      state.processedVideos.push(video)
    }
  },
  
  actions: {
    async processVideo({ commit, state }) {
      commit('SET_STATUS', 'processing')
      try {
        // Processing logic
        const result = await processVideoAPI(state.currentVideo)
        commit('ADD_PROCESSED_VIDEO', result)
        commit('SET_STATUS', 'complete')
      } catch (error) {
        commit('SET_STATUS', 'error')
      }
    }
  }
}
```

## 🧪 Testing

### Unit Test Example

```javascript
import { mount, createLocalVue } from '@vue/test-utils'
import ElementUI from 'element-ui'
import VideoBackgroundRemover from '@/components/VideoBackgroundRemover.vue'

const localVue = createLocalVue()
localVue.use(ElementUI)

describe('VideoBackgroundRemover', () => {
  it('should upload video file', async () => {
    const wrapper = mount(VideoBackgroundRemover, { localVue })
    
    const file = new File(['video'], 'test.mp4', { type: 'video/mp4' })
    const input = wrapper.find('input[type="file"]')
    
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    })
    
    await input.trigger('change')
    
    expect(wrapper.vm.hasFile).toBe(true)
    expect(wrapper.vm.fileName).toBe('test.mp4')
  })
  
  it('should change background mode', async () => {
    const wrapper = mount(VideoBackgroundRemover, { localVue })
    
    await wrapper.setData({ backgroundMode: 'transparent' })
    
    expect(wrapper.vm.backgroundMode).toBe('transparent')
  })
})
```

## 🚧 Future Enhancements

1. **Advanced Algorithms**
   - AI-based background segmentation
   - Real-time machine learning models
   - Multi-layer compositing

2. **Extended Features**
   - Custom background images
   - Background blur effects
   - Color correction
   - Batch processing

3. **Performance Optimization**
   - WebGL acceleration
   - Web Workers for processing
   - Progressive video loading

4. **User Experience**
   - Real-time preview while processing
   - Adjustable quality settings
   - Multiple export formats

## 📝 License

MIT License

## 📞 Support

For issues or questions, please contact the development team or create an issue in the project repository.

---

## Version History

### v1.0.0 (2024-01-20)
- Initial release
- Basic background removal functionality
- Green screen and transparent background options
- 5-second preview feature
- Canvas-based video processing

### Planned Features
- [ ] WebGL acceleration
- [ ] AI-powered segmentation
- [ ] Batch processing
- [ ] Cloud processing option
- [ ] Mobile responsive design
- [ ] Multiple export formats
