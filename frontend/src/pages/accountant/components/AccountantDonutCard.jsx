const buildGradientStops = (segments) => {
  const total = segments.reduce((sum, segment) => sum + Number(segment.value || 0), 0) || 1;
  let cursor = 0;

  return segments
    .map((segment) => {
      const degrees = (Number(segment.value || 0) / total) * 360;
      const start = cursor;
      const end = cursor + degrees;
      cursor = end;
      return `${segment.color} ${start}deg ${end}deg`;
    })
    .join(", ");
};

const AccountantDonutCard = () => {
  return null;
};

export default AccountantDonutCard;
