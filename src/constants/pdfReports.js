import { fetchCustomersData } from "../providers/apiProviders/customerApiProvider";
import { fetchAllCustomerPaymentsData, fetchCustomerPaymentsData } from "../providers/apiProviders/customerPaymentApiProvider";
import { fetchExpensesData } from "../providers/apiProviders/expenseApiProvider";
import {
  fetchAdvancesData,
  fetchIncentivesData,
  fetchIncrementsData,
  fetchLeavesData,
  fetchPayrollData,
  fetchStaffListData,
} from "../providers/apiProviders/hrApiProvider";
import { fetchPreOrdersData } from "../providers/apiProviders/preOrderApiProvider";
import { fetchProductsData } from "../providers/apiProviders/productApiProvider";
import { fetchPurchaseReturnsData, fetchPurchasesData } from "../providers/apiProviders/purchaseApiProvider";
import { fetchRepairsData } from "../providers/apiProviders/repairApiProvider";
import { fetchReplacementsData } from "../providers/apiProviders/replacementApiProvider";
import { fetchSalesData } from "../providers/apiProviders/saleApiProvider";
import { fetchSaleReturnsData } from "../providers/apiProviders/saleReturnApiProvider";
import { fetchServiceSalesData } from "../providers/apiProviders/serviceSaleApiProvider";
import { fetchStockCenterData } from "../providers/apiProviders/stockApiProvider";
import { fetchAllSupplierPaymentsData, fetchSupplierPaymentsData } from "../providers/apiProviders/supplierPaymentApiProvider";
import { fetchSuppliersData } from "../providers/apiProviders/supplierApiProvider";
import { fetchTransfersData } from "../providers/apiProviders/transferApiProvider";
import { customerBalanceMeaning } from "../utils/customer";
import { formatDateTime, formatShortDate } from "../utils/formatDate";
import { monthLabel } from "../utils/hr";
import { formatTaka } from "../utils/money";
import { roundTaka } from "../utils/number";
import { formatPhone } from "../utils/phone";
import { supplierBalanceMeaning } from "../utils/supplier";
import { categoryLabel, EXPENSE_TYPE } from "./expense";
import { leaveTypeLabel } from "./hr";
import { PRE_ORDER_STATUS } from "./preOrder";
import { REPAIR_STATUS } from "./repair";
import { REPLACEMENT_STATUS } from "./replacement";

// What each list's "Export PDF" contains: the same fields the page shows, nothing it hides.
//   period: "range" (from / to), "month" (one month) or none (a list with no dates)
//   columns: { header, value(row), money, nowrap, strong, badge (a status pill), danger (red when there's a value) }; summary(rows): the totals, worked out from the rows in the file

const addUp = (rows, read) => roundTaka(rows.reduce((total, row) => total + (read(row) ?? 0), 0));
const taka = (value) => formatTaka(value ?? 0);
const orDash = (value) => (value ? formatTaka(value) : "—");
const money = (header, value, extra = {}) => ({ header, value, money: true, ...extra });
const when = (header, value) => ({ header, value, nowrap: true });
const pillColumn = (header, value) => ({ header, value, nowrap: true, badge: true });
const pieces = (items) => items.reduce((total, item) => total + item.quantity, 0);
const itemsText = (items) => items.map((item) => `${item.quantity} × ${item.name}`).join("\n");
const productsText = (items) => `${pieces(items)} pcs\n${items.length} product${items.length === 1 ? "" : "s"}`;
const count = (label, rows) => ({ label, value: rows.length.toLocaleString("en-IN") });
const row = (label, value) => ({ label, value: taka(value) });
const person = (user) => [user?.name ?? "—", user?.designation].filter(Boolean).join("\n");
const customerOf = (record) => record.customer?.name ?? "Walk-in";
const contact = (record) => `${record.customerName}\n${formatPhone(record.customerPhone)}`;

const saleCopy = { sale: "POS Orders", exchange: "Exchange Orders" };

export const pdfReports = {
  // showProfit: main admins, like the totals on the page
  sales: (kind, showProfit) => ({
    title: saleCopy[kind],
    period: "range",
    fetch: (params) => fetchSalesData(params, kind),
    columns: [
      when("Invoice", (s) => s.invoiceNo),
      when("Date", (s) => formatDateTime(s.date)),
      { header: "Customer", value: customerOf },
      when("Items", (s) => `${pieces([...s.items, ...(s.externalItems ?? [])])} pcs`),
      money("Total", (s) => taka(s.grandTotal), { strong: true }),
      ...(kind === "exchange" ? [money("Old Device", (s) => taka(s.exchangeValue)), money("Paid Out", (s) => orDash(s.payoutAmount))] : []),
      money("Paid", (s) => taka(s.paidAmount)),
      money("Due", (s) => orDash(s.dueAmount), { danger: true }),
      { header: "Sold By", value: (s) => s.soldBy?.name },
    ],
    summary: (rows) => [
      count("Orders", rows),
      row(
        "Total",
        addUp(rows, (s) => s.grandTotal),
      ),
      row(
        "Paid",
        addUp(rows, (s) => s.paidAmount),
      ),
      row(
        "Due",
        addUp(rows, (s) => s.dueAmount),
      ),
      ...(kind === "exchange"
        ? [
            row(
              "Old devices taken",
              addUp(rows, (s) => s.exchangeValue),
            ),
          ]
        : []),
      ...(showProfit
        ? [
            row(
              "Profit",
              addUp(rows, (s) => s.profit),
            ),
          ]
        : []),
    ],
  }),

  posReturns: () => ({
    title: "POS Returns",
    period: "range",
    fetch: fetchSaleReturnsData,
    columns: [
      when("Return ID", (r) => r.returnNo),
      when("Order", (r) => r.invoiceNo),
      when("Date", (r) => formatDateTime(r.date)),
      { header: "Customer", value: customerOf },
      when("Items", (r) => `${pieces(r.items)} pcs`),
      money("Return Total", (r) => taka(r.totalAmount), { strong: true }),
      money("Refunded", (r) => taka(r.refundAmount)),
      { header: "By", value: (r) => r.createdBy?.name },
    ],
    summary: (rows) => [
      count("Returns", rows),
      row(
        "Return total",
        addUp(rows, (r) => r.totalAmount),
      ),
      row(
        "Refunded",
        addUp(rows, (r) => r.refundAmount),
      ),
    ],
  }),

  serviceSales: () => ({
    title: "Service Sales",
    period: "range",
    fetch: fetchServiceSalesData,
    columns: [
      when("No.", (r) => r.saleNo),
      when("Date", (r) => formatDateTime(r.date)),
      { header: "Service", value: (r) => r.serviceName },
      { header: "Device", value: (r) => `${r.productName}\n${r.serial ?? `${r.quantity} pcs`} · ${r.invoiceNo}` },
      { header: "Customer", value: customerOf },
      money("Total", (r) => taka(r.total), { strong: true }),
      money("Paid", (r) => taka(r.paidAmount)),
      money("Due", (r) => orDash(r.dueAmount), { danger: true }),
      money("Incentive", (r) => taka(r.incentive)),
      { header: "Sold By", value: (r) => r.soldBy?.name },
    ],
    summary: (rows) => [
      count("Services sold", rows),
      row(
        "Total",
        addUp(rows, (r) => r.total),
      ),
      row(
        "Paid",
        addUp(rows, (r) => r.paidAmount),
      ),
      row(
        "Due",
        addUp(rows, (r) => r.dueAmount),
      ),
      row(
        "Staff incentive",
        addUp(rows, (r) => r.incentive),
      ),
    ],
  }),

  purchases: () => ({
    title: "Purchases",
    period: "range",
    fetch: fetchPurchasesData,
    columns: [
      when("Invoice", (p) => p.invoiceNo),
      when("Date", (p) => formatDateTime(p.date)),
      { header: "Supplier", value: (p) => p.supplier?.name },
      { header: "Items", value: (p) => productsText(p.items) },
      money("Total", (p) => taka(p.totalAmount), { strong: true }),
      money("Paid", (p) => taka(p.paidAmount)),
      money("Due", (p) => orDash(p.dueAmount), { danger: true }),
      { header: "By", value: (p) => p.createdBy?.name },
    ],
    summary: (rows) => [
      count("Purchases", rows),
      row(
        "Total",
        addUp(rows, (p) => p.totalAmount),
      ),
      row(
        "Paid",
        addUp(rows, (p) => p.paidAmount),
      ),
      row(
        "Due",
        addUp(rows, (p) => p.dueAmount),
      ),
    ],
  }),

  purchaseReturns: () => ({
    title: "Purchase Returns",
    period: "range",
    fetch: fetchPurchaseReturnsData,
    columns: [
      when("Return No.", (r) => r.returnNo),
      when("Date", (r) => formatDateTime(r.date)),
      { header: "Supplier", value: (r) => r.supplier?.name },
      { header: "Items", value: (r) => productsText(r.items) },
      money("Total", (r) => taka(r.totalAmount), { strong: true }),
      { header: "By", value: (r) => r.createdBy?.name },
    ],
    summary: (rows) => [
      count("Returns", rows),
      row(
        "Total",
        addUp(rows, (r) => r.totalAmount),
      ),
    ],
  }),

  expenses: () => ({
    title: "Expenses",
    period: "range",
    fetch: fetchExpensesData,
    columns: [
      when("No.", (e) => e.expenseNo),
      when("Date", (e) => formatDateTime(e.date)),
      { header: "Expense", value: (e) => [e.title, e.note].filter(Boolean).join("\n") },
      { header: "Category", value: (e) => `${e.type === EXPENSE_TYPE.PRODUCT ? "Product" : "General"} · ${categoryLabel(e.category)}` },
      {
        header: "Paid From / Product",
        value: (e) => {
          if (e.type === EXPENSE_TYPE.GENERAL) return e.payments.map((line) => line.paymentMethod?.name).join(", ");
          const serials = e.items.flatMap((item) => item.serials);
          return `${e.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}${serials.length ? `\n${serials.join(", ")}` : ""}`;
        },
      },
      money("Amount", (e) => taka(e.amount), { strong: true }),
      { header: "By", value: (e) => e.createdBy?.name },
    ],
    summary: (rows) => [
      count("Expenses", rows),
      row(
        "Total",
        addUp(rows, (e) => e.amount),
      ),
    ],
  }),

  // party: "supplier" or "customer"
  payments: ({ title, party, fetch, showBranch }) => ({
    title,
    period: "range",
    fetch,
    columns: [
      when("Payment No.", (p) => p.paymentNo),
      when("Date", (p) => formatDateTime(p.date)),
      ...(showBranch ? [{ header: "Branch", value: (p) => p.branch?.name }] : []),
      { header: party === "supplier" ? "Supplier" : "Customer", value: (p) => p[party]?.name },
      { header: "Methods", value: (p) => p.payments.map((line) => `${line.paymentMethod?.name}: ${formatTaka(line.amount)}`).join("\n") },
      money("Amount", (p) => taka(p.totalAmount), { strong: true }),
      { header: "By", value: (p) => p.createdBy?.name },
    ],
    summary: (rows) => [
      count(title, rows),
      row(
        "Total",
        addUp(rows, (p) => p.totalAmount),
      ),
    ],
  }),
  supplierPayments: () => pdfReports.payments({ title: "Supplier Payments", party: "supplier", fetch: fetchSupplierPaymentsData }),
  allSupplierPayments: () => pdfReports.payments({ title: "Supplier Payments", party: "supplier", fetch: fetchAllSupplierPaymentsData, showBranch: true }),
  customerPayments: (kind, title) => pdfReports.payments({ title, party: "customer", fetch: (params) => fetchCustomerPaymentsData(kind, params) }),
  allCustomerPayments: (kind, title) =>
    pdfReports.payments({ title, party: "customer", fetch: (params) => fetchAllCustomerPaymentsData(kind, params), showBranch: true }),

  transfers: () => ({
    title: "Transfers",
    period: "range",
    fetch: fetchTransfersData,
    columns: [
      when("Transfer No.", (t) => t.transferNo),
      when("Date", (t) => formatDateTime(t.date)),
      { header: "From → To", value: (t) => `${t.fromBranch?.name} → ${t.toBranch?.name}` },
      { header: "Products", value: (t) => itemsText(t.items) },
      money("Quantity", (t) => t.totalQuantity, { strong: true }),
      { header: "By", value: (t) => t.createdBy?.name },
    ],
    summary: (rows) => [count("Transfers", rows), { label: "Pieces moved", value: addUp(rows, (t) => t.totalQuantity) }],
  }),

  replacements: () => ({
    title: "Replacements",
    period: "range",
    fetch: fetchReplacementsData,
    columns: [
      when("No.", (r) => r.replacementNo),
      when("Date", (r) => formatDateTime(r.date)),
      {
        header: "Piece",
        value: (r) => `${r.productName}\n${r.oldSerial ? `${r.oldSerial} → ${r.newSerial}` : `${r.quantity} pcs`} · ${r.invoiceNo}\n${r.reason}`,
      },
      { header: "Customer", value: customerOf },
      money("Cost", (r) => taka(r.newCost), { strong: true }),
      money("Charged", (r) => orDash(r.charge)),
      pillColumn("Faulty piece", (r) => REPLACEMENT_STATUS[r.status]?.label),
    ],
    summary: (rows) => [
      count("Replacements", rows),
      row(
        "New pieces cost",
        addUp(rows, (r) => r.newCost),
      ),
      row(
        "Charged",
        addUp(rows, (r) => r.charge),
      ),
      {
        label: "Still damaged",
        value: addUp(
          rows.filter((r) => r.status === "damaged"),
          (r) => r.quantity,
        ),
      },
    ],
  }),

  repairs: () => ({
    title: "Repairs",
    period: "range",
    fetch: fetchRepairsData,
    columns: [
      when("Job", (r) => r.repairNo),
      when("Received", (r) => formatShortDate(r.receivedAt)),
      { header: "Device", value: (r) => [r.deviceName, r.imei, r.problem].filter(Boolean).join("\n") },
      { header: "Customer", value: contact },
      { header: "Technician", value: (r) => (r.technicianType === "outside" ? `${r.outsideName || "Outside"} (outside)` : (r.technician?.name ?? "Not set")) },
      when("Promised", (r) => (r.promisedDate ? formatShortDate(r.promisedDate) : "—")),
      money("Estimate / Charge", (r) => taka(r.closedAt ? r.charge : r.estimate), { strong: true }),
      money("Paid", (r) => taka(r.paidAmount)),
      money("Due at delivery", (r) => orDash(r.dueAmount), { danger: true }),
      pillColumn("Status", (r) => REPAIR_STATUS[r.status]?.label),
    ],
    // Costs and profit are only sent to people who run repairs
    summary: (rows) => {
      const closed = rows.filter((r) => r.closedAt);
      return [
        count("Jobs", rows),
        row(
          "Charged",
          addUp(closed, (r) => r.charge),
        ),
        row(
          "Paid",
          addUp(rows, (r) => r.paidAmount),
        ),
        row(
          "Due at delivery",
          addUp(closed, (r) => r.dueAmount),
        ),
        ...(rows.some((r) => r.profit !== undefined)
          ? [
              row(
                "Profit",
                addUp(closed, (r) => r.profit),
              ),
            ]
          : []),
      ];
    },
  }),

  preOrders: () => ({
    title: "Pre Orders",
    period: "range",
    fetch: fetchPreOrdersData,
    columns: [
      when("Booking", (r) => r.preOrderNo),
      when("Booked", (r) => formatShortDate(r.bookedAt)),
      { header: "Products", value: (r) => (r.items.length ? itemsText(r.items) : "Old booking") },
      { header: "Customer", value: contact },
      when("Expected", (r) => (r.expectedDate ? formatShortDate(r.expectedDate) : "—")),
      money("Total", (r) => taka(r.total), { strong: true }),
      money("Advance", (r) => taka(r.paidAmount)),
      pillColumn("Status", (r) => (r.ready ? "Stock arrived" : PRE_ORDER_STATUS[r.status]?.label)),
    ],
    summary: (rows) => {
      const booked = rows.filter((r) => r.status === "booked");
      return [
        count("Bookings", rows),
        row(
          "Total",
          addUp(rows, (r) => r.total),
        ),
        { label: "Still booked", value: booked.length },
        row(
          "Advance held",
          addUp(booked, (r) => r.paidAmount),
        ),
      ];
    },
  }),

  customers: () => ({
    title: "Customers",
    fetch: fetchCustomersData,
    columns: [
      { header: "Customer", value: (c) => c.name, strong: true },
      when("Phone", (c) => formatPhone(c.phone)),
      { header: "Address", value: (c) => c.address },
      money("Balance", (c) => `${formatTaka(Math.abs(c.balance))}\n${customerBalanceMeaning(c.balance)}`),
      pillColumn("Status", (c) => (c.status === "active" ? "Active" : "Inactive")),
    ],
    summary: (rows) => [
      count("Customers", rows),
      row(
        "They owe us",
        addUp(rows, (c) => Math.max(c.balance, 0)),
      ),
      row(
        "We owe them",
        addUp(rows, (c) => Math.max(-c.balance, 0)),
      ),
    ],
  }),

  suppliers: () => ({
    title: "Suppliers",
    fetch: fetchSuppliersData,
    columns: [
      { header: "Supplier", value: (s) => s.name, strong: true },
      when("Phone", (s) => formatPhone(s.phone)),
      { header: "Address", value: (s) => s.address },
      money("Balance", (s) => `${formatTaka(Math.abs(s.balance))}\n${supplierBalanceMeaning(s.balance)}`),
      pillColumn("Status", (s) => (s.status === "active" ? "Active" : "Inactive")),
    ],
    summary: (rows) => [
      count("Suppliers", rows),
      row(
        "We owe them",
        addUp(rows, (s) => Math.max(s.balance, 0)),
      ),
      row(
        "They owe us",
        addUp(rows, (s) => Math.max(-s.balance, 0)),
      ),
    ],
  }),

  products: () => ({
    title: "Products",
    fetch: fetchProductsData,
    columns: [
      { header: "Name", value: (p) => p.name, strong: true },
      { header: "Category", value: (p) => p.category?.name },
      { header: "Brand", value: (p) => p.brand?.name },
      pillColumn("Status", (p) => (p.status === "active" ? "Active" : "Inactive")),
    ],
    summary: (rows) => [count("Products", rows)],
  }),

  // branches: the branch columns on the page
  stockCenter: (branches) => ({
    title: "Stock Center",
    fetch: fetchStockCenterData,
    columns: [
      {
        header: "Product",
        value: (r) => [r.product?.name, [r.product?.category?.name, r.product?.brand?.name].filter(Boolean).join(" · ")].filter(Boolean).join("\n"),
      },
      ...branches.map((b) => money(b.name, (r) => r.branches[b._id] || "—")),
      money("Total", (r) => r.quantity, { strong: true }),
      money("Cost Value", (r) => taka(r.value)),
      money("Selling Value", (r) => taka(r.saleValue)),
    ],
    summary: (rows) => [
      count("Products", rows),
      { label: "Pieces", value: addUp(rows, (r) => r.quantity) },
      row(
        "Cost value",
        addUp(rows, (r) => r.value),
      ),
      row(
        "Selling value",
        addUp(rows, (r) => r.saleValue),
      ),
    ],
  }),

  staffHistory: (showBranch) => ({
    title: "Staff History",
    period: "month",
    fetch: fetchStaffListData,
    columns: [
      { header: "Staff", value: (r) => person(r.user) },
      ...(showBranch ? [{ header: "Branch", value: (r) => r.branch }] : []),
      money("Came", (r) => r.counts.present),
      money("Late", (r) => r.counts.late),
      money("Leave", (r) => r.counts.leave + r.counts.unpaidLeave),
      money("Absent", (r) => r.counts.absent),
      money("Salary", (r) => (r.basic ? formatTaka(r.basic) : "Not set")),
      money("Cut", (r) => orDash(r.absentDeduction)),
      money("Incentive", (r) => orDash(r.incentive)),
      money("Advance", (r) => orDash(r.advanceOwed)),
      money("Salary paid", (r) => (r.paid !== null ? formatTaka(r.paid) : "Not yet"), { strong: true }),
    ],
    summary: (rows) => [
      count("Staff", rows),
      row(
        "Salaries",
        addUp(rows, (r) => r.basic),
      ),
      row(
        "Cut",
        addUp(rows, (r) => r.absentDeduction),
      ),
      row(
        "Incentive",
        addUp(rows, (r) => r.incentive),
      ),
      row(
        "Salary paid",
        addUp(rows, (r) => r.paid),
      ),
    ],
  }),

  salaries: () => {
    const toPay = (r) => (r.slip ? r.slip.netPaid : Math.max(r.netBeforeAdvance - r.suggestedAdvance, 0));
    return {
      title: "Salaries",
      period: "month",
      fetch: async ({ month }) => ({ data: (await fetchPayrollData(month)).rows }),
      columns: [
        { header: "Staff", value: (r) => person(r.user) },
        money("Salary", (r) => (!r.basic && !r.incentive ? "Not set" : formatTaka(r.slip?.basic ?? r.basic))),
        money("Absence", (r) => orDash(r.slip?.absentDeduction ?? r.absentDeduction)),
        money("Incentive", (r) => orDash(r.slip?.incentive ?? r.incentive)),
        money("Advance", (r) => orDash(r.slip?.advanceDeducted ?? r.suggestedAdvance)),
        money("To pay", (r) => formatTaka(toPay(r)), { strong: true }),
        pillColumn("Status", (r) => (r.slip ? "Paid" : "Not yet")),
      ],
      summary: (rows) => [
        count("Staff", rows),
        row(
          "Paid",
          addUp(
            rows.filter((r) => r.slip),
            toPay,
          ),
        ),
        row(
          "Still to pay",
          addUp(
            rows.filter((r) => !r.slip),
            toPay,
          ),
        ),
      ],
    };
  },

  incentives: () => ({
    title: "Incentives",
    period: "month",
    fetch: async ({ month }) => ({ data: (await fetchIncentivesData(month)).rows }),
    columns: [
      { header: "Staff", value: (r) => person(r.user) },
      money("Orders", (r) => r.orders),
      money("From sales", (r) => taka(r.sales)),
      money("Services", (r) => r.serviceCount),
      money("From services", (r) => taka(r.services)),
      money("Total", (r) => taka(r.total), { strong: true }),
      pillColumn("Status", (r) => (!r.onStaff ? "Not on staff" : r.paid ? "Paid" : r.total > 0 ? "With salary" : "—")),
    ],
    summary: (rows) => [
      row(
        "Total earned",
        addUp(rows, (r) => r.total),
      ),
      row(
        "From sales",
        addUp(rows, (r) => r.sales),
      ),
      row(
        "From services",
        addUp(rows, (r) => r.services),
      ),
      row(
        "Paid",
        addUp(
          rows.filter((r) => r.paid),
          (r) => r.total,
        ),
      ),
    ],
  }),

  leaves: () => ({
    title: "Leaves",
    period: "range",
    fetch: fetchLeavesData,
    columns: [
      { header: "Staff", value: (r) => person(r.user) },
      when("Type", (r) => leaveTypeLabel(r.type)),
      when("From", (r) => r.from),
      when("To", (r) => r.to),
      money("Days", (r) => r.days),
      pillColumn("Status", (r) => r.status.charAt(0).toUpperCase() + r.status.slice(1)),
      { header: "Reason", value: (r) => r.reason },
    ],
    summary: (rows) => [
      count("Leaves", rows),
      {
        label: "Approved days",
        value: addUp(
          rows.filter((r) => r.status === "approved"),
          (r) => r.days,
        ),
      },
    ],
  }),

  advances: () => ({
    title: "Advance Salary",
    period: "range",
    fetch: fetchAdvancesData,
    columns: [
      when("No.", (r) => r.advanceNo),
      when("Date", (r) => formatDateTime(r.date)),
      { header: "Staff", value: (r) => person(r.user) },
      { header: "Paid from", value: (r) => r.payments.map((line) => line.paymentMethod?.name).join(", ") },
      money("Amount", (r) => taka(r.amount), { strong: true }),
      { header: "Note", value: (r) => r.note },
    ],
    summary: (rows) => [
      count("Advances", rows),
      row(
        "Total given",
        addUp(rows, (r) => r.amount),
      ),
    ],
  }),

  increments: () => ({
    title: "Salary Changes",
    period: "range",
    fetch: fetchIncrementsData,
    columns: [
      { header: "Staff", value: (r) => person(r.user) },
      money("Old salary", (r) => taka(r.oldSalary)),
      money("New salary", (r) => taka(r.newSalary), { strong: true }),
      when("From", (r) => monthLabel(r.effectiveMonth)),
      { header: "Reason", value: (r) => r.reason },
      { header: "By", value: (r) => r.createdBy?.name },
    ],
    summary: (rows) => [count("Salary changes", rows)],
  }),
};
