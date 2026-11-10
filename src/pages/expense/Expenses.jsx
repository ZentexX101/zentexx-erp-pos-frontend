import ExportPdfButton from "../../components/common/export/ExportPdfButton";
import { pdfReports } from "../../constants/pdfReports";
import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import FilterBar from "../../components/common/forms/FilterBar";
import PeriodFilter from "../../components/common/forms/PeriodFilter";
import SearchInput from "../../components/common/forms/SearchInput";
import Select from "../../components/common/forms/Select";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import ExpenseFormModal from "../../components/expense/ExpenseFormModal";
import ExpenseNoteModal from "../../components/expense/ExpenseNoteModal";
import ExpenseSummary from "../../components/expense/ExpenseSummary";
import ExpenseTable from "../../components/expense/ExpenseTable";
import { EXPENSE_CATEGORIES, EXPENSE_TYPE } from "../../constants/expense";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useExpensesData } from "../../hooks/useExpenseApi";
import { hasPermission } from "../../utils/access";
import { periodRange } from "../../utils/period";

const TYPE_OPTIONS = [
  { value: EXPENSE_TYPE.GENERAL, label: "General" },
  { value: EXPENSE_TYPE.PRODUCT, label: "Product" },
];

// This branch's expenses
const Expenses = () => {
  const { user } = useAuth();

  // all states
  const [period, setPeriod] = useState({ period: "this_month", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [creating, setCreating] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

  // call expense api (period, filters and paging run on the backend)
  const { data, isLoading, error } = useExpensesData({ search, type, category, ...periodRange(period.period, period), page, limit });

  // Any filter change starts again from page 1
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleSaved = () => {
    setCreating(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        tools={<ExportPdfButton report={pdfReports.expenses()} params={{ search, type, category }} />}
        title="Expense"
        subtitle="Money spent and stock used up in this branch"
        actions={
          hasPermission(user, "expense.create") && (
            <Button
              onClick={() => {
                setCreating(true);
              }}
            >
              <Icon name="plus" />
              Create Expense
            </Button>
          )
        }
      />

      <FilterBar search={<SearchInput value={searchInput} onChange={withPageReset(setSearchInput)} placeholder="Search title, note or number..." />}>
        <PeriodFilter value={period} onChange={withPageReset(setPeriod)} />
        <Select
          variant="filter"
          aria-label="Type"
          placeholder="Both types"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => withPageReset(setType)(e.target.value)}
        />
        <Select
          variant="filter"
          aria-label="Category"
          placeholder="All categories"
          options={EXPENSE_CATEGORIES}
          value={category}
          onChange={(e) => withPageReset(setCategory)(e.target.value)}
        />
      </FilterBar>

      <ExpenseSummary summary={data?.meta?.summary} activeCategory={category} onCategory={withPageReset(setCategory)} />

      <Alert>{error?.message}</Alert>

      <ExpenseTable
        expenses={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={Boolean(search || type || category) || period.period !== "all"}
        onNote={setViewingNote}
        onPageChange={setPage}
        onLimitChange={withPageReset(setLimit)}
      />

      <ExpenseNoteModal expense={viewingNote} onClose={() => setViewingNote(null)} />

      {creating && <ExpenseFormModal onClose={() => setCreating(false)} onSaved={handleSaved} />}
    </div>
  );
};

export default Expenses;
