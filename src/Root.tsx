import {Composition} from 'remotion';
import {Act1Awakening} from './scenes/Act1Awakening';
import {Act1AwakeningSimple} from './scenes/Act1AwakeningSimple';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Act1-Simple"
        component={Act1AwakeningSimple}
        durationInFrames={1200}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="Act1-Full"
        component={Act1Awakening}
        durationInFrames={1200}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
