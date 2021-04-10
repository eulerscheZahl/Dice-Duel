<!-- LEAGUES level1 level2 -->
<div id="statement_back" class="statement_back" style="display:none"></div>
<div class="statement-body">
  <!-- GOAL -->
  <div class="statement-section statement-goal">
    <h1>
      <span class="icon icon-goal">&nbsp;</span>
      <span>The Goal</span>
    </h1>
    <div class="statement-goal-content">
      Capture more dice of your opponent than you lose.
    </div>
  </div>
  <!-- RULES -->
  <div class="statement-section statement-rules">
    <h1>
      <span class="icon icon-rules">&nbsp;</span>
      <span>Rules</span>
    </h1>
    <div>
      <div class="statement-rules-content">The game is played on an <const>8x8</const> grid. Each player has <const>8</const> dice to start with. Players move alternatingly. <br>
      In each turn a player chooses one of their own dice and rolls it exactly as many cells as the number on top of the die initially showed. The path is a sequence of neighboring cells (diagonals are not considered as neighbors), it's allowed to make turns within the path.
      It is however not allowed to visit the same cell twice. <br>
      The path may not cross any cells which are occupied by other dice. The last step can end on an opponent's die which will then be captured and is out of play.
        <!-- BEGIN level2 -->
        <span style="color: #7cc576; background-color: rgba(124, 197, 118,.1); padding: 2px;">
                Captures are only legal, if the sum of the captured die and the new die (after the move is applied) is equal to <const>7</const>.
                </span>
        <!-- END -->
      </div>
    </div>
  </div>
  <!-- EXPERT RULES -->
  <div class="statement-section statement-expertrules">
    <h1>
      <span class="icon icon-expertrules">&nbsp;</span>
      <span>Expert Rules</span>
    </h1>
    <div class="statement-expert-rules-content">
      You can find the source code of the game at <a href="https://github.com/eulerscheZahl/Dice-Duel">https://github.com/eulerscheZahl/Dice-Duel</a>. <br> <br>
      You can zoom, rotate and pan the viewer by using the mouse wheel and holding the left or right mouse button.
    </div>
  </div>
  <!-- PROTOCOL -->
  <div class="statement-section statement-protocol">
    <h1>
      <span class="icon icon-protocol">&nbsp;</span>
      <span>Game Input</span>
    </h1>
    <!-- Protocol block -->
    <div class="blk">
      <div class="title">Input per turn</div>
      <div class="text">
        <p><span class="statement-lineno">Line 1: </span><var>diceCount</var>, the number of dice on the board</p>
        <p><span class="statement-lineno">Next <var>diceCount</var>lines: </span><var>owner</var> <var>cell</var> <var>top</var> <var>front</var> <var>bottom</var> <var>back</var> <var>left</var> <var>right</var><br>
        <var>owner</var> is <const>0</const> if the die belongs to you, </const>1</const> otherwise.</p>
        <var>cell</var> is the location of the die. The <var>x</var>-coordinate is a letter from <const>A</const> to <const>H</const>, <var>y</var> goes from <const>1</const> to <const>8</const>. <br>
        The remaining values describe the rotation of the die. <var>top</var> is equal to the number of cells the die can move.
      </div>
    </div>

    <!-- Protocol block -->
    <div class="blk">
      <div class="title">Output</div>
      <div class="text">
        <span class="statement-lineno">A single line</span> <action>cell sequence</action>, e.g. <action>B5 URRUL</action>. <action>Cell</action> is the starting position of the move, the <action>sequence</action> can contain the letters <const>U</const>, <const>D</const>, <const>R</const> and <const>L</const> for the directions up, down, right, left.
        <br>
      </div>
    </div>

    <!-- Protocol block -->
    <div class="blk">
      <div class="title">Constraints</div>
        <br>Allotted response time to output
        is &le; <const>50ms</const> per turn (<const>1s</const> for the first turn).</div>

  <br>
  <br>

  Assets:<br>
  Dice <a href="https://www.turbosquid.com/3d-models/3ds-dice/412639">https://www.turbosquid.com/3d-models/3ds-dice/412639</a> <br>
  Board <a href="https://www.turbosquid.com/3d-models/3d-model-chess-games-rook-1540311">https://www.turbosquid.com/3d-models/3d-model-chess-games-rook-1540311</a><br>
  Table <a href="https://www.turbosquid.com/3d-models/3d-small-dining-table-1161153">https://www.turbosquid.com/3d-models/3d-small-dining-table-1161153</a><br>
  Background <a href="https://opengameart.org/content/elyvisions-skyboxes">https://opengameart.org/content/elyvisions-skyboxes</a>
    </div>
  </div>
</div>
