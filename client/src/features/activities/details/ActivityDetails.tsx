import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingIndicator from "../../../app/layout/LoadingIndicator";
import { useStore } from "../../../app/stores/store";
import ActivityDetailChat from "./ActivityDetailChat";
import ActivityDetailHeader from "./ActivityDetailHeader";
import ActivityDetailInfo from "./ActivityDetailInfo";
import ActivityDetailSidebar from "./ActivityDetailSidebar";

export default observer(function ActivityDetails() {
  const { activityStore } = useStore();
  const {
    isLoadingInitial,
    selectedActivity: activity,
    loadActivity,
    clearSelectedActivity,
  } = activityStore;
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) loadActivity(id);
    return () => clearSelectedActivity();
  }, [clearSelectedActivity, id, loadActivity]);

  if (isLoadingInitial || !activity) return <LoadingIndicator />;

  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityDetailHeader activity={activity} />
        <ActivityDetailInfo activity={activity} />
        <ActivityDetailChat activityId={activity.id} />
      </Grid.Column>

      <Grid.Column width={6}>
        <ActivityDetailSidebar activity={activity} />
      </Grid.Column>
    </Grid>
  );
});
