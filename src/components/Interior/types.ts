export type InteriorSceneProps = {
  buildingId: string;
  title: string;
  children: React.ReactNode;
  interactiveObjects?: InteractiveObjectDef[];
};

export type InteractiveObjectDef = {
  id: string;
  label: string;
  x: string;
  y: string;
  width: string;
  height: string;
  onClick: () => void;
};

export type SceneConfig = {
  wallTilePattern: string;
  floorTilePattern: string;
  props: SceneProp[];
  characterX: string;
  characterY: string;
  characterDirection: 'down' | 'left' | 'right' | 'up';
};

export type SceneProp = {
  src: string;
  x: string;
  y: string;
  width: string;
  height: string;
  zIndex?: number;
};

export type RPGPanelVariant = 'paper' | 'wood';
