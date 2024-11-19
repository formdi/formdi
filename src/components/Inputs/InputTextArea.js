import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import Label from "../Labels/Label";
import LabelText from "../Labels/LabelText"; // Nuevo componente

const InputTextArea = ({ name, label, rules, placeholder, disabled, defaultValue, infoText }) => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    if (disabled && defaultValue) {
      setValue(name, defaultValue);
    } else if (!disabled) {
      setValue(name, ""); // Limpia el campo cuando se habilita
    }
  }, [disabled, defaultValue, setValue, name]);

  return (
    <div className="form-group">
      <Label text={label} htmlFor={name} disabled={disabled} />
      {infoText && <LabelText text={infoText} />} {/* Nuevo texto informativo */}
      <textarea
        id={name}
        {...register(name, rules)}
        placeholder={placeholder}
        className={`form-input ${errors[name] ? "is-invalid" : ""}`}
        disabled={disabled}
      />
      {errors[name] && <span className="error-text">{errors[name].message}</span>}
    </div>
  );
};

export default InputTextArea;
