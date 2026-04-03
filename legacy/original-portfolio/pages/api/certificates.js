import data from './certificates.json';

export const getCertificates = () => {
  return data;
};

export default (req, res) => {
  const certificates = getCertificates();
  res.json(certificates);
};
