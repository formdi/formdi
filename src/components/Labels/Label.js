const Label = ({ text, htmlFor, disabled }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`form-label ${disabled ? "disabled" : ""}`}
    >
      {text}
    </label>
  );
};

export default Label;
