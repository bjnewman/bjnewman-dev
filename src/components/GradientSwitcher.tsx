export const gradients = [
  {
    name: 'Pastel Dream',
    value: 'linear-gradient(135deg, #BFDFFF 0%, #FFD1DC 100%)',
  },
  {
    name: 'Sunset Vibes',
    value: 'linear-gradient(135deg, #FF6B6B 0%, #FFA500 50%, #FFD700 100%)',
  },
  {
    name: 'Ocean Breeze',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    name: 'Forest Moss',
    value: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
  },
  {
    name: 'Cotton Candy',
    value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  },
  {
    name: 'Matrix',
    value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  },
  {
    name: 'Lavender Fields',
    value: 'linear-gradient(135deg, #E6D1FF 0%, #FFFFD1 100%)',
  },
];

export const useGradientSwitcher = () => {
  const switchGradient = (gradientValue: string) => {
    document.body.style.background = gradientValue;
    document.body.style.backgroundAttachment = 'fixed';
  };

  const cycleGradient = () => {
    const currentBg = document.body.style.background;
    const currentIndex = gradients.findIndex(g => currentBg.includes(g.value));
    const nextIndex = (currentIndex + 1) % gradients.length;
    switchGradient(gradients[nextIndex].value);
  };

  const resetGradient = () => {
    switchGradient(gradients[0].value);
  };

  return { switchGradient, cycleGradient, resetGradient, gradients };
};
