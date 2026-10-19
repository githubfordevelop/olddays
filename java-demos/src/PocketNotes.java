import javax.microedition.midlet.MIDlet;
import javax.microedition.lcdui.*;
import javax.microedition.rms.RecordStore;
/** Original Java Canvas/RMS notepad with old multi-tap input. */
public class PocketNotes extends MIDlet {
 public void startApp(){Display.getDisplay(this).setCurrent(new Note());}public void pauseApp(){}public void destroyApp(boolean b){}
 class Note extends Canvas {String text="给未来的我：欢迎回到2004年。",status="按确认键保存";String[] letters={" ",".,!?1","abc2","def3","ghi4","jkl5","mno6","pqrs7","tuv8","wxyz9"};int last=-1,count=0;long stamp=0;
 Note(){setFullScreenMode(true);try{RecordStore r=RecordStore.openRecordStore("olddays-note",true);if(r.getNumRecords()>0)text=new String(r.getRecord(1),"UTF-8");r.closeRecordStore();}catch(Exception e){}}
 protected void keyPressed(int k){if(k==119)k='2';if(k==115)k='8';if(k==97)k='4';if(k==100)k='6';if(k==32){save();return;}if(k=='*'){if(text.length()>0)text=text.substring(0,text.length()-1);last=-1;}else if(k=='#'){text+=" ";last=-1;}else if(k>='0'&&k<='9'&&text.length()<500){int n=k-'0';long now=System.currentTimeMillis();if(last==n&&now-stamp<800&&text.length()>0){count=(count+1)%letters[n].length();text=text.substring(0,text.length()-1)+letters[n].charAt(count);}else{count=0;text+=letters[n].charAt(0);}last=n;stamp=now;status="编辑中 · 确认保存";}repaint();}
 void save(){try{RecordStore r=RecordStore.openRecordStore("olddays-note",true);byte[] data=text.getBytes("UTF-8");if(r.getNumRecords()>0)r.setRecord(1,data,0,data.length);else r.addRecord(data,0,data.length);r.closeRecordStore();status="已保存在本浏览器";}catch(Exception e){status="本机存储不可用";}last=-1;repaint();}
 protected void pointerPressed(int x,int y){if(y>getHeight()-40)save();}
 protected void paint(Graphics g){int w=getWidth(),h=getHeight();g.setColor(0xe9dfbc);g.fillRect(0,0,w,h);g.setColor(0x5d6245);g.drawString("掌上记事本 / JAVA",w/2,8,Graphics.TOP|Graphics.HCENTER);Font f=Font.getFont(Font.FACE_MONOSPACE,Font.STYLE_PLAIN,Font.SIZE_SMALL);g.setFont(f);int cols=Math.max(1,(w-20)/f.charWidth('W')),line=0;for(int i=0;i<text.length()&&40+line*16<h-70;i+=cols){g.setColor(0xc8c0a0);g.drawLine(9,55+line*16,w-9,55+line*16);g.setColor(0x575b41);g.drawString(text.substring(i,Math.min(i+cols,text.length())),10,40+line*16,Graphics.TOP|Graphics.LEFT);line++;}g.drawString("2-9英文多击 / *删除 / #空格",w/2,h-56,Graphics.TOP|Graphics.HCENTER);g.setColor(0x6c8060);g.fillRect(8,h-36,w-16,27);g.setColor(0xffffff);g.drawString(status,w/2,h-29,Graphics.TOP|Graphics.HCENTER);}
 }
}
