import Button from "../common/buttons/Button";
import Icon from "../common/icons/Icon";
import PageHeader from "../common/layout/PageHeader";

// Page title with the "Create Brand" button (only for users who can create)
const BrandHeader = ({ canCreate, onCreate }) => (
  <PageHeader
    title="Brand"
    subtitle="Manage all brands"
    actions={
      canCreate && (
        <Button onClick={onCreate}>
          <Icon name="plus" />
          Create Brand
        </Button>
      )
    }
  />
);

export default BrandHeader;
