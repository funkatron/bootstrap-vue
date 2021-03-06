import BImg from './img'
import { getBCR, eventOn, eventOff } from '../../utils/dom'
const THROTTLE = 100

// @vue/component
export default {
  name: 'BImgLazy',
  components: { BImg },
  props: {
    src: {
      type: String,
      default: null,
      required: true
    },
    alt: {
      type: String,
      default: null
    },
    width: {
      type: [Number, String],
      default: null
    },
    height: {
      type: [Number, String],
      default: null
    },
    blankSrc: {
      // If null, a blank image is generated
      type: String,
      default: null
    },
    blankColor: {
      type: String,
      default: 'transparent'
    },
    blankWidth: {
      type: [Number, String],
      default: null
    },
    blankHeight: {
      type: [Number, String],
      default: null
    },
    show: {
      type: Boolean,
      default: false
    },
    fluid: {
      type: Boolean,
      default: false
    },
    fluidGrow: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },
    thumbnail: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: [Boolean, String],
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: false
    },
    offset: {
      type: [Number, String],
      default: 360
    },
    throttle: {
      type: [Number, String],
      default: THROTTLE
    }
  },
  data () {
    return {
      isShown: false,
      scrollTimeout: null
    }
  },
  computed: {
    computedSrc () {
      return (!this.blankSrc || this.isShown) ? this.src : this.blankSrc
    },
    computedBlank () {
      return !(this.isShown || this.blankSrc)
    },
    computedWidth () {
      return this.isShown ? this.width : (this.blankWidth || this.width)
    },
    computedHeight () {
      return this.isShown ? this.height : (this.blankHeight || this.height)
    }
  },
  watch: {
    show (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.isShown = newVal
        if (!newVal) {
          // Make sure listeners are re-enabled if img is force set to blank
          this.setListeners(true)
        }
      }
    },
    isShown (newVal, oldVal) {
      if (newVal !== oldVal) {
        // Update synched show prop
        this.$emit('update:show', newVal)
      }
    }
  },
  created () {
    this.isShown = this.show
  },
  mounted () {
    if (this.isShown) {
      this.setListeners(false)
    } else {
      this.setListeners(true)
      this.$nextTick(this.checkView)
    }
  },
  activated () {
    /* istanbul ignore if */
    if (!this.isShown) {
      this.setListeners(true)
      this.$nextTick(this.checkView)
    }
  },
  deactivated () {
    /* istanbul ignore next */
    this.setListeners(false)
  },
  beforeDestroy () {
    /* istanbul ignore next */
    this.setListeners(false)
  },
  methods: {
    setListeners (on) {
      clearTimeout(this.scrollTimer)
      this.scrollTimeout = null
      const root = window
      if (on) {
        eventOn(this.$el, 'load', this.checkView)
        eventOn(root, 'scroll', this.onScroll)
        eventOn(root, 'resize', this.onScroll)
        eventOn(root, 'orientationchange', this.onScroll)
        eventOn(document, 'transitionend', this.onScroll)
      } else {
        eventOff(this.$el, 'load', this.checkView)
        eventOff(root, 'scroll', this.onScroll)
        eventOff(root, 'resize', this.onScroll)
        eventOff(root, 'orientationchange', this.onScroll)
        eventOff(document, 'transitionend', this.onScroll)
      }
    },
    checkView () /* istanbul ignore next: can't test getBoundingClientRect in JSDOM */ {
      // check bounding box + offset to see if we should show
      if (this.isShown) {
        this.setListeners(false)
        return
      }
      const offset = parseInt(this.offset, 10) || 0
      const docElement = document.documentElement
      const view = {
        l: 0 - offset,
        t: 0 - offset,
        b: docElement.clientHeight + offset,
        r: docElement.clientWidth + offset
      }
      /* istanbul ignore next */
      const box = getBCR(this.$el)
      /* istanbul ignore if */
      if (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b) {
        // image is in view (or about to be in view)
        this.isShown = true
        this.setListeners(false)
      }
    },
    onScroll () {
      if (this.isShown) {
        this.setListeners(false)
      } else {
        clearTimeout(this.scrollTimeout)
        this.scrollTimeout = setTimeout(this.checkView, parseInt(this.throttle, 10) || THROTTLE)
      }
    }
  },
  render (h) {
    return h(
      'b-img',
      {
        props: {
          src: this.computedSrc,
          alt: this.alt,
          blank: this.computedBlank,
          blankColor: this.blankColor,
          width: this.computedWidth,
          height: this.computedHeight,
          fluid: this.fluid,
          fluidGrow: this.fluidGrow,
          block: this.block,
          thumbnail: this.thumbnail,
          rounded: this.rounded,
          left: this.left,
          right: this.right,
          center: this.center
        }
      }
    )
  }
}
