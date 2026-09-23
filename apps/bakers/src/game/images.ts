import flour from '../assets/items/flour.png'
import sugar from '../assets/items/sugar.png'
import butter from '../assets/items/butter.png'
import eggs from '../assets/items/eggs.png'
import milk from '../assets/items/milk.png'
import salt from '../assets/items/salt.png'
import bakingPowder from '../assets/items/baking_powder.png'
import bakingSoda from '../assets/items/baking_soda.png'
import yeast from '../assets/items/yeast.png'
import chocolate from '../assets/items/chocolate.png'
import creamCheese from '../assets/items/cream_cheese.png'
import strawberry from '../assets/items/strawberry.png'
import apple from '../assets/items/apple.png'
import oats from '../assets/items/oats.png'
import lemon from '../assets/items/lemon.png'
import blueberry from '../assets/items/blueberry.png'
import banana from '../assets/items/banana.png'
import almond from '../assets/items/almond.png'
import coconut from '../assets/items/coconut.png'
import raisin from '../assets/items/raisin.png'
import pumpkin from '../assets/items/pumpkin.png'
import cream from '../assets/items/cream.png'
import cinnamon from '../assets/items/cinnamon.png'
import cocoa from '../assets/items/cocoa.png'
import honey from '../assets/items/honey.png'
import vanilla from '../assets/items/vanilla.png'
import woodPlank from '../assets/items/wood_plank.png'
import hammerNails from '../assets/items/hammer_nails.png'
import tape from '../assets/items/tape.png'
import lubricant from '../assets/items/lubricant.png'
import screwdriver from '../assets/items/screwdriver.png'
import sewingKit from '../assets/items/sewing_kit.png'
import canvasFabric from '../assets/items/canvas_fabric.png'
import rope from '../assets/items/rope.png'
import varnish from '../assets/items/varnish.png'
import cookies from '../assets/items/cookies.png'
import cake from '../assets/items/cake.png'
import pie from '../assets/items/pie.png'
import brownie from '../assets/items/brownie.png'
import bread from '../assets/items/bread.png'
import pancake from '../assets/items/pancake.png'
import cheeseTart from '../assets/items/cheese_tart.png'
import strawberryTart from '../assets/items/strawberry_tart.png'
import pastry from '../assets/items/pastry.png'
import oatmealCookie from '../assets/items/oatmeal_cookie.png'
import almondCookie from '../assets/items/almond_cookie.png'
import cupcake from '../assets/items/cupcake.png'
import lemonCake from '../assets/items/lemon_cake.png'
import coconutCake from '../assets/items/coconut_cake.png'
import appleCake from '../assets/items/apple_cake.png'
import bananaBread from '../assets/items/banana_bread.png'
import pineappleBun from '../assets/items/pineapple_bun.png'
import scone from '../assets/items/scone.png'
import eggTart from '../assets/items/egg_tart.png'
import cinnamonRoll from '../assets/items/cinnamon_roll.png'
import creamPuff from '../assets/items/cream_puff.png'
import swissRoll from '../assets/items/swiss_roll.png'
import donut from '../assets/items/donut.png'
import pumpkinMuffin from '../assets/items/pumpkin_muffin.png'
import blueberryMuffin from '../assets/items/blueberry_muffin.png'
import croissant from '../assets/items/croissant.png'
import madeleine from '../assets/items/madeleine.png'
import raisinBread from '../assets/items/raisin_bread.png'
import lemonTart from '../assets/items/lemon_tart.png'
import chocolateMuffin from '../assets/items/chocolate_muffin.png'
import bananaMuffin from '../assets/items/banana_muffin.png'
import coin from '../assets/items/coin.png'
import basket from '../assets/items/basket.png'
import satchel from '../assets/items/satchel.png'
import baker from '../assets/people/baker.png'
import brother from '../assets/people/brother.png'
import jack from '../assets/people/jack.png'
import morgan from '../assets/people/morgan.png'
import coral from '../assets/people/coral.png'
import luna from '../assets/people/luna.png'
import kitchen from '../assets/scenes/kitchen.png'
import shop from '../assets/scenes/shop.png'
import beach from '../assets/scenes/beach.png'

export const images = {
  flour,
  sugar,
  butter,
  eggs,
  milk,
  salt,
  baking_powder: bakingPowder,
  baking_soda: bakingSoda,
  yeast,
  chocolate,
  cream_cheese: creamCheese,
  strawberry,
  apple,
  oats,
  lemon,
  blueberry,
  banana,
  almond,
  coconut,
  raisin,
  pumpkin,
  cream,
  cinnamon,
  cocoa,
  honey,
  vanilla,
  wood_plank: woodPlank,
  hammer_nails: hammerNails,
  tape,
  lubricant,
  screwdriver,
  sewing_kit: sewingKit,
  canvas_fabric: canvasFabric,
  rope,
  varnish,
  cookies,
  cake,
  pie,
  brownie,
  bread,
  pancake,
  cheese_tart: cheeseTart,
  strawberry_tart: strawberryTart,
  pastry,
  oatmeal_cookie: oatmealCookie,
  almond_cookie: almondCookie,
  cupcake,
  lemon_cake: lemonCake,
  coconut_cake: coconutCake,
  apple_cake: appleCake,
  banana_bread: bananaBread,
  pineapple_bun: pineappleBun,
  scone,
  egg_tart: eggTart,
  cinnamon_roll: cinnamonRoll,
  cream_puff: creamPuff,
  swiss_roll: swissRoll,
  donut,
  pumpkin_muffin: pumpkinMuffin,
  blueberry_muffin: blueberryMuffin,
  croissant,
  madeleine,
  raisin_bread: raisinBread,
  lemon_tart: lemonTart,
  chocolate_muffin: chocolateMuffin,
  banana_muffin: bananaMuffin,
  coin,
  basket,
  satchel,
  baker,
  brother,
  jack,
  morgan,
  coral,
  luna,
  kitchen,
  shop,
  beach,
} as const

export type ImageKey = keyof typeof images
