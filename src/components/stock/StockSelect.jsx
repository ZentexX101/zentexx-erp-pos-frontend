import { useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useStockOptionsData } from "../../hooks/useStockApi";
import StockSearchSelect from "./StockSearchSelect";

// Picker of this branch's in-stock products (searched on the backend, max 20)
const StockSelect = ({ label, onPick, placeholder }) => {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const { data: rows = [], isFetching } = useStockOptionsData(search);

  return (
    <StockSearchSelect
      label={label}
      placeholder={placeholder}
      searchInput={searchInput}
      onSearchInput={setSearchInput}
      rows={rows}
      loading={isFetching}
      onPick={onPick}
    />
  );
};

export default StockSelect;
