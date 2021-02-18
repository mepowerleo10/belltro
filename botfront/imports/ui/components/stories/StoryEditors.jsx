import { withTracker } from 'meteor/react-meteor-data';
import React, {
    useContext, useState, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Loading } from '../utils/Utils';

import { Stories } from '../../../api/story/stories.collection';
import StoryEditorContainer from './StoryEditorContainer';
import { ProjectContext } from '../../layouts/context';

function StoryEditors(props) {
    const { stories, workingLanguage } = props;

    const { addResponses } = useContext(ProjectContext);
    const [lastUpdate, setLastUpdate] = useState(0);

    const lastDate = useMemo(() => Date.now(), [stories.length, workingLanguage]);

    const responsesInFetchedStories = useMemo(() => stories.reduce(
        (acc, curr) => [
            ...acc,
            ...(curr.events || []).filter(
                event => event.match(/^utter_/) && !acc.includes(event),
            ),
        ],
        [],
    ), [stories.length, workingLanguage]);

    useEffect(() => {
        if (responsesInFetchedStories.length) {
            addResponses(responsesInFetchedStories).then((res) => {
                if (res) setLastUpdate(res);
                else setLastUpdate(lastDate);
            });
        } else setLastUpdate(() => Date.now());
    }, [stories.length, workingLanguage, JSON.stringify(responsesInFetchedStories)]);

    const editors = stories.map(story => (
        <StoryEditorContainer
            story={story}
            disabled={false}
            key={story._id}
            title={story.title}
        />
    ));

    return <Loading loading={lastUpdate < lastDate}>{editors}</Loading>;
}

StoryEditors.propTypes = {
    stories: PropTypes.array,
    workingLanguage: PropTypes.string.isRequired,
};

StoryEditors.defaultProps = {
    stories: [],
};

const StoryEditorsTracker = withTracker((props) => {
    const { projectId, selectedIds } = props;
    const storiesHandler = Meteor.subscribe('stories.selected', projectId, selectedIds);
    const stories = Stories.find({ projectId, _id: { $in: selectedIds } })
        .fetch()
        .sort(
            (a, b) => selectedIds.findIndex(id => id === a._id)
                - selectedIds.findIndex(id => id === b._id),
        );

    return {
        ready: storiesHandler.ready(),
        stories,
    };
})(StoryEditors);

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
});

export default connect(mapStateToProps)(StoryEditorsTracker);
