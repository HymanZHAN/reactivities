import { Formik, Form } from "formik";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Header, Tab, Grid, Button } from "semantic-ui-react";
import { Profile, ProfileAboutFormValues } from "../../../app/models/profile";
import { useStore } from "../../../app/stores/store";
import * as Yup from "yup";
import { useParams } from "react-router";
import ReTextInput from "../../../app/common/form/ReTextInput";
import ReTextArea from "../../../app/common/form/ReTextArea";

interface Props {
  profile: Profile;
}

export default observer(function ProfileAbout({ profile }: Props) {
  const {
    profileStore: { isCurrentUser, loadProfile, updateProfile },
  } = useStore();
  const { username } = useParams<{ username: string }>();
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileAboutFormValues>(
    new ProfileAboutFormValues(profile)
  );

  const validationSchema = Yup.object({
    displayName: Yup.string().required("Display Name is required"),
  });

  useEffect(() => {
    if (username && username !== profile.username)
      loadProfile(username).then((profile) => setProfileForm(new ProfileAboutFormValues(profile)));
    setProfileForm(new ProfileAboutFormValues(profile));
  }, [username, loadProfile, profile.username, profile]);

  function handleFormSubmit(profile: ProfileAboutFormValues) {
    updateProfile(profile).then(() => setEditMode(false));
  }

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16}>
          <Header floated="left" icon="image" content="About" />
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content={editMode ? "Cancel" : "Edit"}
              onClick={() => setEditMode(!editMode)}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
          {editMode ? (
            <Formik
              initialValues={profileForm}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={handleFormSubmit}
            >
              {({ handleSubmit, isValid, dirty, isSubmitting }) => (
                <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
                  <ReTextInput label="Display Name" name="displayName" placeholder="Display Name" />
                  <ReTextArea label="Bio" name="bio" placeholder="Bio" rows={8} />
                  <Button
                    disabled={isSubmitting || !dirty || !isValid}
                    floated="right"
                    positive
                    type="submit"
                    content="Submit"
                    loading={isSubmitting}
                  />
                </Form>
              )}
            </Formik>
          ) : (
            <p style={{ whiteSpace: "pre-wrap" }}>{profile.bio}</p>
          )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
});
