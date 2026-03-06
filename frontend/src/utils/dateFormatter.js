export const formatReadableDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
};

export const formatReadableDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const readableDate = formatReadableDate(value);
  const readableTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${readableDate} • ${readableTime}`;
};
