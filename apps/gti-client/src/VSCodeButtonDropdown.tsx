import type { ButtonAppearance } from "@vscode/webview-ui-toolkit";
import type { ReactNode } from "react";

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

import "./VSCodeButtonDropdown.scss";

export function VSCodeButtonDropdown<
  T extends { label: ReactNode; id: string }
>({
  options,
  appearance,
  onClick,
  selected,
  onChangeSelected,
  buttonDisabled,
  pickerDisabled,
  icon,
}: {
  options: ReadonlyArray<T>;
  appearance: Exclude<ButtonAppearance, "icon">; // icon-type buttons don't have a natrual spot for the dropdown
  onClick: (selected: T) => unknown;
  selected: T;
  onChangeSelected: (newSelected: T) => unknown;
  buttonDisabled?: boolean;
  pickerDisabled?: boolean;
  /** Icon to place in the button */
  icon?: React.ReactNode;
}) {
  const selectedOption =
    options.find((opt) => opt.id === selected.id) ?? options[0];
  return (
    <div className="vscode-button-dropdown">
      <VSCodeButton
        appearance={appearance}
        onClick={buttonDisabled ? undefined : () => onClick(selected)}
        disabled={buttonDisabled}
      >
        {icon ?? null} {selectedOption.label}
      </VSCodeButton>
      <select
        disabled={pickerDisabled}
        onClick={(e) => e.stopPropagation()}
        onChange={(event) => {
          const matching = options.find(
            (opt) => opt.id === (event.target.value as T["id"])
          );
          if (matching != null) {
            onChangeSelected(matching);
          }
        }}
      >
        {options.map((option) => (
          <option
            key={option.id}
            value={option.id}
            selected={option.id === selected.id}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
