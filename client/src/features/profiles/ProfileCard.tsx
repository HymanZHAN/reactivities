import { observer } from "mobx-react-lite";
import { Card, Icon, Image } from "semantic-ui-react";
import { Profile } from "../../app/models/profile";
import FollowButton from "../activities/profiles/FollowButton";

interface Props {
  profile: Profile;
}
export default observer(function ProfileCard({ profile }: Props) {
  return (
    <Card>
      <Image src={profile.image || "assets/user.png"} />
      <Card.Content>
        <Card.Header>{profile.displayName}</Card.Header>
        <Card.Description>
          {profile.bio?.length > 40 ? profile.bio?.substring(0, 40) + "..." : profile.bio}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Icon name="user" />
        {profile.followersCount} followers
      </Card.Content>
      <FollowButton profile={profile} />
    </Card>
  );
});
