/* eslint-disable */
import { PureComponent, memo, useCallback, useEffect, useRef, useState } from 'react'
import { Box } from 'grommet'
import { VariableSizeList } from 'react-window-reversed'
import { FixedSizeList as FixedList, VariableSizeList as List } from 'react-window'
import Autosizer from 'react-virtualized-auto-sizer'
import memoize from 'memoize-one'
import { CellMeasurer } from 'forge-core'

class SmartLoader extends PureComponent {
  _listRef = null

  _lastRenderedStartIndex = -1

  _lastRenderedStopIndex = -1

  render() {
    const { children } = this.props

    return children({
      onItemsRendered: this._onItemsRendered,
      ref: this._setRef,
    })
  }

  _setRef = listRef => {
    this._listRef = listRef
  }

  _onItemsRendered = ({ visibleStartIndex, visibleStopIndex }) => {

    this._lastRenderedStartIndex = visibleStartIndex
    this._lastRenderedStopIndex = visibleStopIndex

    this._ensureRowsLoaded(visibleStartIndex, visibleStopIndex)
  }

  _ensureRowsLoaded = (startIndex, stopIndex) => {
    const {
      isItemLoaded,
      itemCount,
      threshold = 15,
    } = this.props

    startIndex = Math.max(0, startIndex - threshold)
    stopIndex = Math.min(itemCount - 1, stopIndex + threshold)

    if (!isItemLoaded(startIndex) || !isItemLoaded(stopIndex)) {
      this._loadUnloadedRanges(startIndex, stopIndex)
    }
  }

  _loadUnloadedRanges = (startIndex, stopIndex) => {
    // loadMoreRows was renamed to loadMoreItems in v1.0.3; will be removed in v2.0
    const loadMoreItems = this.props.loadMoreItems || this.props.loadMoreRows
    const promise = loadMoreItems()
    if (!promise) return

    promise.then(() => {
      if (startIndex > this._lastRenderedStopIndex || stopIndex < this._lastRenderedStartIndex) {
        // Handle an unmount while promises are still in flight.
        if (this._listRef == null) {
          return
        }

        // Resize cached row sizes for VariableSizeList,
        // otherwise just re-render the list.
        if (typeof this._listRef.resetAfterIndex === 'function') {
          this._listRef.resetAfterIndex(startIndex, true)
        }
        else {
          // HACK reset temporarily cached item styles to force PureComponent to re-render.
          // This is pretty gross, but I'm okay with it for now.
          // Don't judge me.
          if (typeof this._listRef._getItemStyleCache === 'function') {
            this._listRef._getItemStyleCache(-1)
          }
          this._listRef.forceUpdate()
        }
      }
    })
  }
}

function shallowDiffers(prev, next) {
  for (const attribute in prev) {
    if (!(attribute in next)) {
      return true
    }
  }
  for (const attribute in next) {
    if (prev[attribute] !== next[attribute]) {
      return true
    }
  }

  return false
}

function areEqual(prevProps, nextProps) {
  const { style: prevStyle, ...prevRest } = prevProps
  const { style: nextStyle, ...nextRest } = nextProps

  return (
    !shallowDiffers(prevStyle, nextStyle) && !shallowDiffers(prevRest, nextRest)
  )
}

const Item = ({ index, mapper, isItemLoaded, placeholder, items, setSize }) => {
  if (!isItemLoaded(index)) {
    return placeholder && placeholder(index)
  }

  return mapper(items[index], { next: items[index + 1] || {}, prev: items[index - 1] || {} }, { setSize, index })
}
const ItemWrapper = memo(({ data: { setSize, width, refreshKey, items, isItemLoaded, placeholder, mapper }, style, index, ...props }) => {
  const [rowRef, setRowRef] = useState(null)
  const item = items[index]
  const sizeCallback = useCallback(() => {
    rowRef && setSize(index, rowRef.getBoundingClientRect().height)
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowRef, index])

  useEffect(() => {
    sizeCallback()
  }, [sizeCallback, width, item, index])

  return (
    <CellMeasurer
      refreshKey={refreshKey}
      index={index}
      setSize={setSize}
    >
      {({ registerChild }) => (
        <div style={style}>
          <Box
            classNames={refreshKey}
            ref={ref => {
              registerChild(ref)
              setRowRef(ref)
            }}
            margin={index === 0 ? { bottom: 'small' } : null}
          >
            <Item
              index={index}
              items={items}
              setSize={sizeCallback}
              isItemLoaded={isItemLoaded}
              placeholder={placeholder}
              mapper={mapper}
            />
          </Box>
        </div>
      )}
    </CellMeasurer>
  )
}, areEqual)

const FixedItemWrapper = memo(({ data: { items, isItemLoaded, placeholder, mapper }, style, index }) => (
  <div style={style}>
    <Item
      index={index}
      items={items}
      isItemLoaded={isItemLoaded}
      placeholder={placeholder}
      mapper={mapper}
    />
  </div>
))

const buildItemData = memoize((setSize, mapper, isItemLoaded, items, parentRef, width, placeholder, refreshKey, props) => (
  { setSize, mapper, isItemLoaded, items, parentRef, width, placeholder, refreshKey, ...props }
))

export default function SmoothScroller({
  hasNextPage, placeholder, loading, items, loadNextPage, mapper, listRef, setListRef, handleScroll, refreshKey, setLoader, ...props }) {
  const sizeMap = useRef({})
  const setSize = useCallback((index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size }
    listRef && listRef.resetAfterIndex(index, true)
  }, [sizeMap, listRef])
  const getSize = useCallback(index => sizeMap.current[index] || 50, [sizeMap])
  const count = items.length
  const itemCount = hasNextPage ? count + 7 : count
  const loadMoreItems = loading ? () => {} : loadNextPage
  const isItemLoaded = useCallback(index => !hasNextPage || index < count, [hasNextPage, count])

  return (
    <SmartLoader
      ref={setLoader}
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      minimumBatchSize={50}
      threshold={75}
    >
      {({ onItemsRendered, ref }) => (
        <Autosizer>
          {({ height, width }) => (
            <VariableSizeList
              reversed
              height={height}
              width={width}
              itemCount={itemCount}
              itemSize={getSize}
              itemKey={index => `${refreshKey}:${index}`}
              itemData={buildItemData(setSize, mapper, isItemLoaded, items, listRef, width, placeholder, refreshKey, props)}
              onScroll={({ scrollOffset }) => handleScroll && handleScroll(scrollOffset > (height / 2))}
              onItemsRendered={ctx => {
                props.onRendered && props.onRendered(ctx)
                onItemsRendered(ctx)
              }}
              ref={listRef => {
                setListRef && setListRef(listRef)
                ref(listRef)
              }}
              {...props}
            >
              {ItemWrapper}
            </VariableSizeList>
          )}
        </Autosizer>
      )}
    </SmartLoader>
  )
}

export function StandardScroller({
  hasNextPage, placeholder, loading, items, loadNextPage, mapper, listRef, setListRef, handleScroll, refreshKey, setLoader, ...props }) {
  const sizeMap = useRef({})
  const setSize = useCallback((index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size }
    listRef && listRef.resetAfterIndex(index, true)
  }, [sizeMap, listRef])
  const getSize = useCallback(index => sizeMap.current[index] || 50, [sizeMap])
  const count = items.length
  const itemCount = hasNextPage ? count + 7 : count
  const loadMoreItems = loading ? () => {} : loadNextPage
  const isItemLoaded = useCallback(index => !hasNextPage || index < count, [hasNextPage, count])

  return (
    <SmartLoader
      ref={setLoader}
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      minimumBatchSize={50}
      threshold={75}
    >
      {({ onItemsRendered, ref }) => (
        <Autosizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={itemCount}
              itemSize={getSize}
              itemKey={index => `${refreshKey}:${index}`}
              itemData={buildItemData(setSize, mapper, isItemLoaded, items, listRef, width, placeholder, refreshKey, props)}
              onScroll={({ scrollOffset }) => handleScroll && handleScroll(scrollOffset > (height / 2))}
              onItemsRendered={ctx => {
                props.onRendered && props.onRendered(ctx)
                onItemsRendered(ctx)
              }}
              ref={listRef => {
                setListRef && setListRef(listRef)
                ref(listRef)
              }}
              {...props}
            >
              {ItemWrapper}
            </List>
          )}
        </Autosizer>
      )}
    </SmartLoader>
  )
}

export function FixedScroller({ hasNextPage, loading, items, loadNextPage, mapper, itemSize, placeholder, setLoader }) {
  const count = items.length
  const itemCount = hasNextPage ? count + 7 : count
  const loadMoreItems = loading ? () => {} : loadNextPage
  const isItemLoaded = useCallback(index => !hasNextPage || index < count, [hasNextPage, count])

  return (
    <SmartLoader
      ref={setLoader}
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      minimumBatchSize={50}
      threshold={75}
    >
      {({ onItemsRendered, ref }) => (
        <Autosizer>
          {({ height, width }) => (
            <FixedList
              height={height}
              width={width}
              itemSize={itemSize}
              itemCount={itemCount}
              itemData={buildItemData(null, mapper, isItemLoaded, items, null, width, placeholder)}
              onItemsRendered={onItemsRendered}
              ref={ref}
            >
              {FixedItemWrapper}
            </FixedList>
          )}
        </Autosizer>
      )}
    </SmartLoader>
  )
}
