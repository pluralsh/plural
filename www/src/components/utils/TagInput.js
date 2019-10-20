import React, {Component, createRef, useState} from 'react'
import {Box, Text, Keyboard, TextInput, Button} from 'grommet'
import {FormClose} from 'grommet-icons'

const Tag = ({ children, onRemove, ...rest }) => {
  const [hover, setHover] = useState(false)
  const padding = {horizontal: 'xxsmall', vertical: 'xxsmall'}
  const tag = (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      round='xsmall'
      direction="row"
      align="center"
      pad={{horizontal: 'xxsmall'}}
      background={hover ? 'tagMedium' : 'tagLight'}
      margin={{ vertical: "xxsmall" }}
      {...rest}
    >
      <Box pad={padding} justify='center' align='center'>
        <Text size="xsmall" margin={{ right: "xxsmall" }}>
          {children}
        </Text>
      </Box>
      {onRemove && <Box width='15px' pad={padding} justify='center' align='center'>
         <FormClose size="small" />
      </Box>}
    </Box>
  );

  if (onRemove) {
    return <Button onClick={onRemove}>{tag}</Button>;
  }
  return tag;
};

class TagInput extends Component {
  state = {
    currentTag: ""
  };

  boxRef = createRef();

  UNSAFE_componentDidMount() {
    this.forceUpdate();
  }

  updateCurrentTag = event => {
    const { onChange } = this.props;
    this.setState({ currentTag: event.target.value });
    if (onChange) {
      onChange(event);
    }
  };

  onAddTag = tag => {
    const { onAdd } = this.props;
    if (onAdd) {
      onAdd(tag);
    }
    this.setState({currentTag: ""})
  };

  onEnter = () => {
    const { currentTag } = this.state;
    if (currentTag.length) {
      this.onAddTag(currentTag);
      this.setState({ currentTag: "" });
    }
  };

  renderValue = () => {
    const { value, onRemove } = this.props;

    return value.map((v, index) => (
      <Tag margin="xxsmall" key={`${v}${index}`} onRemove={() => onRemove(v)}>
        {v}
      </Tag>
    ));
  };

  render() {
    const { value = [], onAdd, onRemove, onChange, ...rest } = this.props;
    const { currentTag } = this.state;
    return (
      <Keyboard onEnter={this.onEnter}>
        <Box
          fill='horizontal'
          direction="row"
          align="center"
          border="all"
          ref={this.boxRef}
          round={this.props.round}
        >
          <Box direction='row' wrap align='center'>
            {value.length > 0 && this.renderValue()}
          </Box>
          <Box flex style={{ minWidth: "120px" }}>
            <TextInput
              type="search"
              plain
              dropTarget={this.boxRef.current}
              {...rest}
              onChange={this.updateCurrentTag}
              value={currentTag}
              onSelect={event => {
                event.stopPropagation();
                this.onAddTag(event.suggestion);
              }}
            />
          </Box>
          {this.props.button}
        </Box>
      </Keyboard>
    );
  }
}

export default TagInput