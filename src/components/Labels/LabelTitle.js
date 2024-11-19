const LabelTitle = ({ text, disabled }) => {
  return <h2 className={`form-title ${disabled ? "disabled" : ""}`}>• {text}</h2>;
};

export default LabelTitle;
