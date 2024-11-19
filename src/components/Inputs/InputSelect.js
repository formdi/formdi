import { useFormContext } from "react-hook-form";
import Label from "../Labels/Label";
import LabelText from "../Labels/LabelText"; // Nuevo componente

const InputSelect = ({ name, label, options, rules, disabled, infoText }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="form-group">
      <Label text={label} htmlFor={name} disabled={disabled} />
      {infoText && <LabelText text={infoText} />} {/* Nuevo texto informativo */}
      <select
        id={name}
        {...register(name, rules)}
        className={`form-select ${errors[name] ? "is-invalid" : ""}`}
        disabled={disabled}
      >
        <option value="">Seleccione una opción</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && <span className="error-text">{errors[name].message}</span>}
    </div>
  );
};

export default InputSelect;
