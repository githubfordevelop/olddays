import javax.microedition.midlet.MIDlet;
import javax.microedition.lcdui.*;
import java.util.Random;
/** Original Java ME snake demo. No historical commercial game assets. */
public class OldSnake extends MIDlet {
 private Board board;
 public void startApp(){if(board==null)board=new Board();Display.getDisplay(this).setCurrent(board);}
 public void pauseApp(){if(board!=null)board.paused=true;}
 public void destroyApp(boolean b){if(board!=null)board.alive=false;}
 class Board extends Canvas implements Runnable {
  int[] xs=new int[400],ys=new int[400];int length,dx,dy,nx,ny,fx,fy,score;boolean paused=true,over=false,alive=true;Random random=new Random();
  Board(){setFullScreenMode(true);reset();new Thread(this).start();}
  void reset(){length=4;for(int i=0;i<length;i++){xs[i]=7-i;ys[i]=7;}dx=1;dy=0;nx=1;ny=0;score=0;over=false;paused=true;food();}
  void food(){boolean occupied;do{occupied=false;fx=Math.abs(random.nextInt()%20);fy=Math.abs(random.nextInt()%20);for(int i=0;i<length;i++)if(xs[i]==fx&&ys[i]==fy)occupied=true;}while(occupied&&length<400);}
  protected void keyPressed(int k){int action=0;try{action=getGameAction(k);}catch(Exception e){}if(k==KEY_NUM5||action==FIRE){if(over)reset();paused=!paused;}else if((k==KEY_NUM2||action==UP)&&dy!=1){nx=0;ny=-1;}else if((k==KEY_NUM8||action==DOWN)&&dy!=-1){nx=0;ny=1;}else if((k==KEY_NUM4||action==LEFT)&&dx!=1){nx=-1;ny=0;}else if((k==KEY_NUM6||action==RIGHT)&&dx!=-1){nx=1;ny=0;}else if(k==KEY_STAR)reset();repaint();}
  public void run(){while(alive){if(isShown()&&!paused&&!over){dx=nx;dy=ny;int x=xs[0]+dx,y=ys[0]+dy;boolean eat=x==fx&&y==fy;for(int i=0;i<(eat?length:length-1);i++)if(xs[i]==x&&ys[i]==y)over=true;if(x<0||x>=20||y<0||y>=20)over=true;if(!over){if(eat&&length<399){length++;score+=10;}for(int i=length-1;i>0;i--){xs[i]=xs[i-1];ys[i]=ys[i-1];}xs[0]=x;ys[0]=y;if(eat)food();}repaint();}try{Thread.sleep(180);}catch(Exception e){}}}
  protected void paint(Graphics g){int w=getWidth(),h=getHeight(),cell=Math.min(w/20,(h-82)/20),ox=(w-cell*20)/2,oy=40;g.setColor(0xb8c998);g.fillRect(0,0,w,h);g.setColor(0x2b4529);g.drawString("OLDDAYS JAVA SNAKE",w/2,7,Graphics.TOP|Graphics.HCENTER);g.drawString("SCORE "+score,5,23,Graphics.TOP|Graphics.LEFT);g.drawRect(ox-1,oy-1,20*cell+1,20*cell+1);for(int i=0;i<length;i++)g.fillRect(ox+xs[i]*cell+1,oy+ys[i]*cell+1,cell-1,cell-1);g.setColor(0x9b4c35);g.fillRect(ox+fx*cell+1,oy+fy*cell+1,cell-1,cell-1);g.setColor(0x2b4529);g.drawString(over?"GAME OVER - 5 RETRY":paused?"5 START / PAUSE":"2 UP  4 LEFT  6 RIGHT  8 DOWN",w/2,oy+20*cell+10,Graphics.TOP|Graphics.HCENTER);g.drawString("Original MIDlet - * RESET",w/2,h-17,Graphics.TOP|Graphics.HCENTER);}
 }
}
