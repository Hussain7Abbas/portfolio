import data from './events.json';

export const getEvents = () => {
  return data;
};

export default (req, res) => {
  const events = getEvents();
  res.json(events);
};
