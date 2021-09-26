import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Button, Header, Segment } from "semantic-ui-react";
import LoadingIndicator from "../../../app/layout/LoadingIndicator";
import { useStore } from "../../../app/stores/store";
import { v4 as uuid } from "uuid";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ReTextInput from "../../../app/common/form/ReTextInput";
import ReTextArea from "../../../app/common/form/ReTextArea";
import ReSelectInput from "../../../app/common/form/ReSelectInput";
import { categoryOptions } from "../../../app/common/options/categoryOptions";
import ReDateInput from "../../../app/common/form/ReDateInput";
import { ActivityFormValues } from "../../../app/models/activity";

export default observer(function ActivityForm() {
  const history = useHistory();
  const { activityStore } = useStore();
  const { updateActivity, createActivity, loadActivity, isLoadingInitial } = activityStore;

  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues());

  const validationSchema = Yup.object({
    title: Yup.string().required("The activity title is required."),
    description: Yup.string().required("The activity description is required."),
    category: Yup.string().required(),
    date: Yup.string().required("The activity date is required").nullable(),
    city: Yup.string().required(),
    venue: Yup.string().required(),
  });

  useEffect(() => {
    if (id) loadActivity(id).then((activity) => setActivity(new ActivityFormValues(activity)));
  }, [id, loadActivity]);

  function handleFormSubmit(activity: ActivityFormValues) {
    if (!activity.id) {
      let newActivity = {
        ...activity,
        id: uuid(),
      };
      createActivity(newActivity).then(() => history.push(`/activities/${newActivity.id}`));
    } else {
      updateActivity(activity).then(() => history.push(`/activities/${activity.id}`));
    }
  }

  if (isLoadingInitial) {
    return <LoadingIndicator content={"Loading activity..."} />;
  }

  return (
    <Segment clearing>
      <Header content="Activity Details" sub color="teal" />
      <Formik
        validationSchema={validationSchema}
        enableReinitialize
        initialValues={activity}
        onSubmit={handleFormSubmit}
      >
        {({ handleSubmit, isValid, dirty, isSubmitting }) => (
          <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
            <ReTextInput name="title" placeholder="Title" />
            <ReTextArea name="description" rows={3} placeholder="Description" />
            <ReSelectInput options={categoryOptions} name="category" placeholder="Category" />
            <ReDateInput
              name="date"
              placeholderText="Date"
              showTimeSelect
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
            <Header content="Location Details" sub color="teal" />

            <ReTextInput name="city" placeholder="City" />
            <ReTextInput name="venue" placeholder="Venue" />

            <Button
              disabled={isSubmitting || !dirty || !isValid}
              floated="right"
              positive
              type="submit"
              content="Submit"
              loading={isSubmitting}
            />
            <Button
              as={Link}
              to={activity.id ? `/activities/${activity.id}` : `/activities`}
              floated="right"
              type="button"
              content="Cancel"
            />
          </Form>
        )}
      </Formik>
    </Segment>
  );
});
