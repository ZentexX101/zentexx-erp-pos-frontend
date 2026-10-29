import Button from "../common/buttons/Button";
import Icon from "../common/icons/Icon";
import PageHeader from "../common/layout/PageHeader";

// Page title with the "Create Payment Method" button (only for users who can create)
const PaymentMethodHeader = ({ canCreate, onCreate }) => (
  <PageHeader
    title="Payment Method"
    subtitle="Cash, card, mobile banking and bank accounts of this branch"
    actions={
      canCreate && (
        <Button onClick={onCreate}>
          <Icon name="plus" />
          Create Payment Method
        </Button>
      )
    }
  />
);

export default PaymentMethodHeader;
