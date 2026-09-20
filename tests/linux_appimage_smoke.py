#!/usr/bin/env python3
"""Run the REAL Linux binary under Xvfb and inspect its WebKit/Web Audio state.

The probe is test-only LD_PRELOAD code, never shipped with the game. Assertions
use existing debug hooks, not a replacement game or a JavaScript DOM emulator.
No hardware speaker, real controller, GPU driver or FUSE mount is tested.
"""
import argparse
import json
import os
from pathlib import Path
import select
import signal
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]

def stop(process):
    if process and process.poll() is None:
        os.killpg(process.pid, signal.SIGTERM)
        try: process.wait(timeout=5)
        except subprocess.TimeoutExpired: os.killpg(process.pid, signal.SIGKILL)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    source=parser.add_mutually_exclusive_group(required=True)
    source.add_argument('--appimage',type=Path,help='AppImage file or bundle output directory')
    source.add_argument('--appdir',type=Path,help='Previously extracted AppDir (local investigation)')
    parser.add_argument('--media-profile',choices=['audio-only','full'],default='audio-only')
    parser.add_argument('--html-override',type=Path,help='LOCAL ONLY: test a new frontend in an existing shell; reported explicitly')
    parser.add_argument('--host-library-path',type=Path,help='LOCAL ONLY: helper libraries missing on the test host')
    parser.add_argument('--allow-root-test-sandbox',action='store_true',help='Explicit container-only sandbox exception, never a game setting')
    parser.add_argument('--report',type=Path,default=ROOT/'test-results/linux-native.json')
    args=parser.parse_args();args.report.parent.mkdir(parents=True,exist_ok=True)
    if os.geteuid()==0 and not args.allow_root_test_sandbox:
        parser.error('Run as a normal user, or explicitly enable the isolated-container test exception.')
    display_proc=app_proc=None
    with tempfile.TemporaryDirectory(prefix='gumflow-linux-smoke-') as tmp:
        temp=Path(tmp);preload=temp/'probe.so'
        subprocess.run(['gcc','-shared','-fPIC','-O2','-Wall',str(ROOT/'tests/native/webkit_probe.c'),'-ldl','-o',str(preload)],check=True)
        if args.appdir:
            appdir=args.appdir.resolve()
        else:
            image=args.appimage.resolve()
            if image.is_dir():
                matches=list(image.glob('*.AppImage'))
                if len(matches)!=1: raise RuntimeError(f'Expected one AppImage; found {matches}')
                image=matches[0]
            image.chmod(image.stat().st_mode|0o100)
            with open(args.report.with_suffix('.extract.log'),'wb') as log:
                subprocess.run([str(image),'--appimage-extract'],cwd=temp,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=90)
            appdir=temp/'squashfs-root'
        profile=json.loads((ROOT/'config/linux-audio-plugins.json').read_text())
        bundled_plugins=sorted(p.name for p in (appdir/'usr/lib/gstreamer-1.0').glob('*.so'))
        required={'libgst'+n+'.so' for n in profile['plugins']}
        allowed=required|{'libgst'+n+'.so' for n in profile.get('optionalPlugins',[])}
        missing=required-set(bundled_plugins)
        if missing:raise RuntimeError(f'Packaged audio decoders missing: {sorted(missing)}')
        if args.media_profile=='audio-only' and set(bundled_plugins)-allowed:
            raise RuntimeError('Audio-only staging was ignored: unexpected bundled plugins '+str(sorted(set(bundled_plugins)-allowed)))
        # Dedicated X11 server, unique display chosen by Xvfb itself.
        read_fd,write_fd=os.pipe()
        with open(args.report.with_suffix('.log'),'wb') as log:
            try:
                display_proc=subprocess.Popen(['Xvfb','-displayfd',str(write_fd),'-screen','0','1280x800x24','-nolisten','tcp'],pass_fds=(write_fd,),stdout=log,stderr=log,start_new_session=True)
                os.close(write_fd)
                if not select.select([read_fd],[],[],10)[0]:raise RuntimeError('Xvfb did not allocate a display')
                display=':'+os.read(read_fd,32).decode().strip();os.close(read_fd)
                env=os.environ.copy();env['DISPLAY']=display
                for variable,subdir in [('HOME','home'),('XDG_CONFIG_HOME','config'),('XDG_CACHE_HOME','cache'),('XDG_DATA_HOME','data'),('XDG_RUNTIME_DIR','runtime')]:
                    p=temp/subdir;p.mkdir(mode=0o700);env[variable]=str(p)
                env.update({'APPDIR':str(appdir),'GUMFLOW_PROBE_JS':str(ROOT/'tests/native/smoke.js'),
                            'GUMFLOW_PROBE_OUT':str(temp/'report.json'),'LD_PRELOAD':str(preload),
                            'GST_REGISTRY_1_0':str(temp/'gst-registry.bin'),'WEBKIT_DISABLE_COMPOSITING_MODE':'1'})
                if args.html_override:env['GUMFLOW_PROBE_HTML']=str(args.html_override.resolve())
                else:env.pop('GUMFLOW_PROBE_HTML',None)
                if args.host_library_path:env['LD_LIBRARY_PATH']=str(args.host_library_path.resolve())
                if args.allow_root_test_sandbox:env['WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS']='1'
                app_proc=subprocess.Popen(['dbus-run-session','--',str(appdir/'AppRun')],cwd=appdir,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
                report={};deadline=time.monotonic()+100
                while time.monotonic()<deadline:
                    try:report=json.loads((temp/'report.json').read_text())
                    except (FileNotFoundError,json.JSONDecodeError):pass
                    if report.get('done'):break
                    if app_proc.poll() is not None:raise RuntimeError(f'App exited ({app_proc.returncode}); see native .log')
                    time.sleep(.25)
                report['testContext']={'platform':'Linux','softwareDisplay':True,'frontendOverride':bool(args.html_override),'sandboxException':args.allow_root_test_sandbox,
                    'mediaProfile':args.media_profile,'bundledPlugins':bundled_plugins,'audioHardwareTested':False,'gamepadHardwareTested':False,'appdirUncompressedBytes':sum(p.stat().st_size for p in appdir.rglob('*') if p.is_file() and not p.is_symlink())}
                args.report.write_text(json.dumps(report,indent=2)+'\n')
                if not report.get('done') or report.get('errors'):raise RuntimeError(f'Linux smoke failed: {report.get("errors",[])}; done={report.get("done")}')
                print('PASS: title autoplay, four decoded tracks with PCM, seven worlds, seven arenas, both Endless modes, classic music and pause.')
                print('Test context:',json.dumps(report['testContext']))
            finally:stop(app_proc);stop(display_proc)

if __name__=='__main__':main()
