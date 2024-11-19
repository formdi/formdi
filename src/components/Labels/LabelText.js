const LabelText = ({ text }) => {
  return <p className="form-info-text" dangerouslySetInnerHTML={{ __html: text }} />;
};

export default LabelText;
