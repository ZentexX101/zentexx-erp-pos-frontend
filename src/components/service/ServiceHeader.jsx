import Button from "../common/buttons/Button";
import Icon from "../common/icons/Icon";
import PageHeader from "../common/layout/PageHeader";

// Page title with the "Create Service" button (only for users who can create)
const ServiceHeader = ({ canCreate, onCreate }) => (
  <PageHeader
    title="Service"
    subtitle="Manage all services"
    actions={
      canCreate && (
        <Button onClick={onCreate}>
          <Icon name="plus" />
          Create Service
        </Button>
      )
    }
  />
);

export default ServiceHeader;
