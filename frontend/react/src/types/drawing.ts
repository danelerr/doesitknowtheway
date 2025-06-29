export interface Tool {
  name: string;
  cursor: string;
}

export interface DrawingSettings {
  color: string;
  lineWidth: number;
  tool: Tool;
  isErasing: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingData {
  imageData: string; // base64 encoded image
}
