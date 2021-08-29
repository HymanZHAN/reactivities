import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, Image } from "semantic-ui-react";
import LoadingIndicator from "../../../app/layout/LoadingIndicator";
import { useStore } from "../../../app/stores/store";

export default observer(function ActivityDetails() {
  const { activityStore } = useStore();
  const {
    isLoadingInitial,
    selectedActivity: activity,
    loadActivity,
  } = activityStore;
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) loadActivity(id);
  }, [id, loadActivity]);

  if (isLoadingInitial || !activity) return <LoadingIndicator />;

  return (
    <Card fluid>
      <Image src={`/assets/categoryImages/${activity.category}.jpg`} />
      <Card.Content>
        <Card.Header>{activity.title}</Card.Header>
        <Card.Meta>
          <span>{activity.date}</span>
        </Card.Meta>
        <Card.Description>{activity.description}</Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Button.Group widths="2">
          <Button
            as={Link}
            to={`/activities`}
            basic
            color="grey"
            content="Cancel"
          />
          <Button
            as={Link}
            to={`/manage/${activity.id}`}
            basic
            color="blue"
            content="Edit"
          />
        </Button.Group>
      </Card.Content>
    </Card>
  );
});
