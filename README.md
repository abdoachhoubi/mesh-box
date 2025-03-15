# Mesh Gradient Generator

A modern, interactive tool for creating beautiful mesh gradients with Next.js and Canvas API.

![Mesh Gradient Generator](https://placeholder.svg?height=400&width=800)

## Features

- **Interactive Canvas**: Create and manipulate mesh points with real-time updates
- **Customizable Gradients**: Control color, position, and radius of each mesh point
- **Layout Controls**: Adjust canvas dimensions and background color
- **Export Options**:
  - PNG export for high-quality images
  - JPG export for smaller file sizes
  - JSON export to save your gradient configurations
- **Import Functionality**: Load previously created gradients from JSON files
- **Responsive Design**: Works on desktop and mobile devices

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mesh-gradient-generator.git
   cd mesh-gradient-generator
   ```

2. Install dependencies:

```shellscript
npm install
```

3. Start the development server:

```shellscript
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Creating a Gradient

1. **Adjust Layout**: Use the Layout tab to set canvas dimensions and background color
2. **Add Points**: Click "Add Mesh Point" to create gradient points
3. **Customize Points**: Select a point to edit its color and radius
4. **Position Points**: Drag points around the canvas to adjust their position

### Exporting Your Gradient

1. Click the "Export" button
2. Choose your preferred format:

3. PNG: High-quality, lossless image
4. JPG: Smaller file size
5. JSON: Save configuration for later editing

### Importing a Gradient

1. Click the "Import JSON" button
2. Select a previously exported JSON file
3. Your gradient will be loaded and ready for editing

## JSON Format

The exported JSON follows this structure:

```json
{
  "layout": {
    "width": 800,
    "height": 500,
    "backgroundColor": "#ffffff"
  },
  "points": [
    {
      "id": "point-1234567890",
      "x": 250,
      "y": 150,
      "color": "#ff0000",
      "radius": 200
    },
    ...
  ]
}
```

## Technologies Used

- **Next.js**: React framework for the application
- **TypeScript**: For type-safe code
- **Canvas API**: For rendering the gradients
- **Tailwind CSS**: For styling
- **shadcn/ui**: For UI components
- **react-colorful**: For color picking
- **Sonner**: For toast notifications
- **Lucide React**: For icons

## Development

### Project Structure

```plaintext
mesh-gradient-generator/
├── app/
│   ├── page.tsx        # Main page component
│   └── layout.tsx      # App layout
├── components/
│   ├── mesh-gradient-generator.tsx  # Main component
│   └── ui/             # UI components
├── public/             # Static assets
└── README.md           # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [react-colorful](https://github.com/omgovich/react-colorful) for the color picker
- [Sonner](https://sonner.emilkowal.ski/) for toast notifications
