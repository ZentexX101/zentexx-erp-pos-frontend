import Button from "../common/buttons/Button";
import Icon from "../common/icons/Icon";
import PageHeader from "../common/layout/PageHeader";

// Page title with the "Create Product" button (only for users who can create)
const ProductHeader = ({ canCreate, onCreate }) => (
  <PageHeader
    title="Product"
    subtitle="Manage and search your product"
    actions={
      canCreate && (
        <Button onClick={onCreate}>
          <Icon name="plus" />
          Create Product
        </Button>
      )
    }
  />
);

export default ProductHeader;
