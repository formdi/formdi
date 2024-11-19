import React from "react";
import { useFormContext } from "react-hook-form";
import Label from "../Labels/Label";

const RadioGroup = ({ name, label, options, rules, disabled = false, defaultValue }) => {
  const { register, formState: { errors }, setValue } = useFormContext();

  // Establecer valor predeterminado si está definido
  React.useEffect(() => {
    if (defaultValue) {
      setValue(name, defaultValue);
    }
  }, [defaultValue, name, setValue]);

  return (
    <div className="form-group">
      {/* Etiqueta opcional para el grupo */}
      {label && <Label text={label} htmlFor={name} />}
      
      {/* Opciones del RadioGroup */}
      <div className="radio-group">
        {options.map((option, index) => (
          <label key={index} className="radio-label" style={{ display: "block", marginBottom: "10px" }}>
            <input
              type="radio"
              value={option.value}
              {...register(name, rules)}
              disabled={disabled}
              style={{ marginRight: "8px" }} // Espacio entre radio button y el texto
            />
            {option.label}
          </label>
        ))}
      </div>
      
      {/* Mostrar errores si existen */}
      {errors[name] && <span className="error-text">{errors[name].message}</span>}
    </div>
  );
};

export default RadioGroup;
